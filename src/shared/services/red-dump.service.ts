import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {
  combineLatest,
  combineLatestWith,
  EMPTY,
  map,
  mergeAll,
  Observable,
  OperatorFunction,
  pipe,
  reduce,
  shareReplay
} from "rxjs";
import {RedNodeAst, RedNodeKind} from "../red-ast/red-node.ast";
import {RedEnumAst} from "../red-ast/red-enum.ast";
import {RedBitfieldAst} from "../red-ast/red-bitfield.ast";
import {RedClassAst} from "../red-ast/red-class.ast";
import {RedFunctionAst} from "../red-ast/red-function.ast";
import {RedPropertyAst} from "../red-ast/red-property.ast";
import {SettingsService} from "./settings.service";
import {cyrb53} from "../string";

@Injectable({
  providedIn: 'root'
})
export class RedDumpService {
  readonly enums$: Observable<RedEnumAst[]>;
  readonly bitfields$: Observable<RedBitfieldAst[]>;
  readonly classes$: Observable<RedClassAst[]>;
  readonly structs$: Observable<RedClassAst[]>;
  readonly functions$: Observable<RedFunctionAst[]>;

  readonly badges$: Observable<number>;

  private readonly nodes$: Observable<RedNodeAst[]>;

  constructor(private readonly settingsService: SettingsService,
              private readonly http: HttpClient) {
    this.enums$ = this.http.get(`/assets/reddump/enums.json`).pipe(
      map((json: any) => json.map(RedEnumAst.fromJson)),
      map((enums: RedEnumAst[]) => {
        enums.sort(RedEnumAst.sort);
        return enums;
      }),
      shareReplay(1)
    );
    this.bitfields$ = this.http.get(`/assets/reddump/bitfields.json`).pipe(
      map((json: any) => json.map(RedBitfieldAst.fromJson)),
      map((bitfields: RedBitfieldAst[]) => {
        bitfields.sort(RedBitfieldAst.sort);
        return bitfields;
      }),
      shareReplay(1)
    );
    const objects$: Observable<RedClassAst[]> = this.http.get(`/assets/reddump/classes.json`).pipe(
      map((json: any) => json.map(RedClassAst.fromJson)),
      map((objects: RedClassAst[]) => {
        objects.sort(RedClassAst.sort);
        objects.forEach((object) => {
          object.properties.sort(RedPropertyAst.sort);
          object.functions.sort(RedFunctionAst.sort);
        });
        return objects;
      }),
      shareReplay(1)
    );

    this.classes$ = objects$.pipe(
      map((objects) => objects.filter((object) => !object.isStruct)),
      shareReplay(1),
    );
    this.structs$ = objects$.pipe(
      map((objects) => objects.filter((object) => object.isStruct)),
      shareReplay(1),
    );
    this.functions$ = this.http.get(`/assets/reddump/globals.json`).pipe(
      map((json: any) => json.map(RedFunctionAst.fromJson)),
      map((functions) => {
        functions.sort(RedFunctionAst.sort);
        return functions;
      }),
      shareReplay(1),
      this.ignoreDuplicate(),
    );
    this.badges$ = objects$.pipe(
      mergeAll(),
      map((object: RedClassAst) => {
        const props = object.properties.map(RedPropertyAst.computeBadges).reduce(this.getMax, 1);
        const funcs = object.functions.map(RedFunctionAst.computeBadges).reduce(this.getMax, 1);

        return Math.max(props, funcs);
      }),
      reduce(this.getMax),
      shareReplay(1),
    );
    this.nodes$ = combineLatest([
      this.enums$,
      this.bitfields$,
      this.classes$,
      this.structs$,
      this.functions$,
    ]).pipe(
      map((data) => [
        ...data[0] as RedNodeAst[],
        ...data[1] as RedNodeAst[],
        ...data[2] as RedNodeAst[],
        ...data[3] as RedNodeAst[],
        ...data[4] as RedNodeAst[],
      ]),
      shareReplay(1)
    );
    this.loadAliases();
  }

  getById(id: number, nameOnly?: boolean): Observable<RedNodeAst | undefined> {
    nameOnly ??= false;
    return this.nodes$.pipe(
      map((nodes) => nodes.find((node) => {
        let match: boolean;

        if (nameOnly) {
          match = cyrb53(node.name) === id;
        } else {
          match = node.id === id;
        }
        if (!match && node.aliasName) {
          match = cyrb53(node.aliasName) === id;
        }
        return match;
      }))
    );
  }

  getEnumById(id: number): Observable<RedEnumAst | undefined> {
    return this.enums$.pipe(this.findById(id));
  }

  getBitfieldById(id: number): Observable<RedBitfieldAst | undefined> {
    return this.bitfields$.pipe(this.findById(id));
  }

  getClassById(id: number): Observable<RedClassAst | undefined> {
    return this.classes$.pipe(this.findById(id));
  }

  getStructById(id: number): Observable<RedClassAst | undefined> {
    return this.structs$.pipe(this.findById(id));
  }

  getFunctionById(id: number): Observable<RedFunctionAst | undefined> {
    return this.functions$.pipe(this.findById(id));
  }

  getParentsByName(name: string,
                   kind: RedNodeKind.class | RedNodeKind.struct): Observable<RedClassAst[]> {
    let query$: Observable<RedClassAst[]>;

    if (kind === RedNodeKind.class) {
      query$ = this.classes$;
    } else if (kind === RedNodeKind.struct) {
      query$ = this.structs$;
    } else {
      return EMPTY;
    }
    return query$.pipe(
      map((objects) => {
        const parents: RedClassAst[] = [];
        let parent = objects.find((object) => object.name === name);

        if (parent) {
          parents.push(parent);
        }
        while (parent && parent.parent) {
          parent = objects.find((object) => object.name === parent!.parent);
          if (parent) {
            parents.push(parent);
          }
        }
        return parents;
      })
    );
  }

  getChildrenByName(name: string,
                    kind: RedNodeKind.class | RedNodeKind.struct): Observable<RedClassAst[]> {
    let query$: Observable<RedClassAst[]>;

    if (kind === RedNodeKind.class) {
      query$ = this.classes$;
    } else if (kind === RedNodeKind.struct) {
      query$ = this.structs$;
    } else {
      return EMPTY;
    }
    return query$.pipe(
      map((objects) => {
        return objects.filter((object) => object.parent === name);
      })
    );
  }

  private ignoreDuplicate(): OperatorFunction<RedFunctionAst[], RedFunctionAst[]> {
    return pipe(
      combineLatestWith(this.settingsService.ignoreDuplicate$),
      map(([functions, ignoreDuplicate]) => {
        if (!ignoreDuplicate) {
          return functions;
        }
        return functions.filter((func) => {
          return !func.name.startsWith('Operator') && !func.name.startsWith('Cast');
        });
      })
    );
  }

  private loadAliases(): void {
    this.nodes$.subscribe((nodes) => {
      const aliases: RedNodeAst[] = nodes.filter((node) => node.aliasName);

      nodes
        .filter((node) => node.kind !== RedNodeKind.enum && node.kind !== RedNodeKind.bitfield)
        .forEach((node) => {
          if (node.kind === RedNodeKind.class || node.kind === RedNodeKind.struct) {
            RedClassAst.loadAliases(aliases, node as RedClassAst);
          } else if (node.kind === RedNodeKind.function) {
            RedFunctionAst.loadAlias(aliases, node as RedFunctionAst);
          }
        });
    });
  }

  private findById<T extends RedNodeAst>(id: number): OperatorFunction<T[], T | undefined> {
    return pipe(
      map((objects) => objects.find((object) => object.id === id))
    );
  }

  private getMax(a: number, b: number): number {
    return Math.max(a, b);
  }
}
