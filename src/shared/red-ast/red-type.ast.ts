import {RedNodeAst, RedNodeKind} from "./red-node.ast";
import {cyrb53} from "../string";
import {RedPrimitiveDef, RedTemplateDef} from "./red-definitions.ast";

export interface RedTypeJson {
  readonly a?: number; // flag
  readonly b?: string; // name
  readonly c?: RedTypeJson; // inner type
  readonly d?: number; // array size
}

export interface RedTypeAst extends RedNodeAst {
  //readonly name: string;
  readonly flag?: RedPrimitiveDef | RedTemplateDef;
  readonly innerType?: RedTypeAst;
  readonly size?: number;
}

export class RedTypeAst {
  static isPrimitive(type: RedTypeAst): boolean {
    return type.flag !== undefined && type.flag >= RedPrimitiveDef.Void && type.flag <= RedPrimitiveDef.Variant;
  }

  static toString(type: RedTypeAst): string {
    let str: string = '';

    // TODO: ignore script_ref<T> when syntax is for Redscript / Lua ?
    if (type.innerType !== undefined) {
      str += `${type.name}<`;
      str += RedTypeAst.toString(type.innerType);
      if (type.size !== undefined) {
        str += `; ${type.size}`;
      }
      str += '>';
    } else {
      str = type.name;
    }
    return str;
  }

  static fromJson(json: RedTypeJson): RedTypeAst {
    const flag: RedPrimitiveDef | RedTemplateDef | undefined = json.a;
    const name: string = (flag === undefined) ? json.b! : ((flag <= RedPrimitiveDef.Variant) ? RedPrimitiveDef[flag] : RedTemplateDef[flag]);

    return {
      id: cyrb53(name),
      kind: RedNodeKind.type,
      name: name,
      flag: flag,
      innerType: (json.c !== undefined) ? RedTypeAst.fromJson(json.c) : undefined,
      size: json.d,
    };
  }
}
