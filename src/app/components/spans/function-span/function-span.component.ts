import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ArgumentSpanComponent} from "../argument-span/argument-span.component";
import {TypeSpanComponent} from "../type-span/type-span.component";

import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {RedFunctionAst} from "../../../../shared/red-ast/red-function.ast";
import {RedClassAst} from "../../../../shared/red-ast/red-class.ast";
import {RedVisibilityDef} from "../../../../shared/red-ast/red-definitions.ast";
import {NDBDocumentationComponent} from "../../ndb-documentation/ndb-documentation.component";
import {ClassDocumentation} from "../../../../shared/services/documentation.service";
import {CodeSyntax, SettingsService} from "../../../../shared/services/settings.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {CodeFormatterService} from "../../../../shared/services/code-formatter.service";
import {MatTooltipModule} from "@angular/material/tooltip";
import {RouterLink} from "@angular/router";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatDivider} from "@angular/material/divider";

@Component({
  selector: 'function-span',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatDivider,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TypeSpanComponent,
    ArgumentSpanComponent,
    NDBDocumentationComponent
  ],
  templateUrl: './function-span.component.html',
  styleUrl: './function-span.component.scss'
})
export class FunctionSpanComponent {

  /**
   * Offset in pixels to add between badges and function's name, with at least 12px.
   */
  align: string = '12px';

  /**
   * Whether documentation should be visible?
   */
  isVisible: boolean = false;

  scope: string = '';
  hasFullName: boolean = false;
  isListener: boolean = false;

  node?: RedFunctionAst;

  /**
   * Optional, when this function is a member of a class or a struct.
   */
  memberOf?: RedClassAst;

  /**
   * Whether grab code feature can be used?
   */
  @Input()
  canCopy: boolean = true;

  /**
   * Whether documentation feature can be used?
   */
  @Input()
  canDocument: boolean = false;

  /**
   * Whether share feature can be used?
   */
  @Input()
  canShare: boolean = true;

  documentation?: ClassDocumentation;

  protected readonly CodeSyntax = CodeSyntax;

  private readonly documentationSubject: BehaviorSubject<ClassDocumentation | undefined> = new BehaviorSubject<ClassDocumentation | undefined>(undefined);
  private readonly documentation$: Observable<ClassDocumentation | undefined> = this.documentationSubject.asObservable();

  constructor(protected readonly fmtService: CodeFormatterService,
              private readonly settingsService: SettingsService) {
    combineLatest([
      this.settingsService.showDocumentation$,
      this.documentation$
    ]).pipe(takeUntilDestroyed()).subscribe(this.onShowDocumentation.bind(this));
  }

  @Input('node')
  set _node(value: RedFunctionAst | undefined) {
    this.node = value;
    this.scope = (this.node) ? RedVisibilityDef[this.node.visibility] : '';
    this.hasFullName = !!this.node && (this.node.name !== this.node.fullName);
  }

  @Input('memberOf')
  set _memberOf(value: RedClassAst | undefined) {
    this.memberOf = value;
    this.isListener = !!this.memberOf && (this.memberOf.aliasName ?? this.memberOf.name).endsWith('Listener');
  }

  @Input('documentation')
  set _documentation(value: ClassDocumentation | undefined) {
    this.documentation = value;
    this.documentationSubject.next(value);
  }

  /**
   * Total number of badges to align with.
   */
  @Input()
  set badges(count: number) {
    // Compute remaining empty badges to align with.
    count--;
    if (this.node?.isNative) count--;
    if (this.node?.isStatic) count--;
    if (this.node?.isFinal) count--;
    if (this.node?.isCallback) count--;
    if (this.node?.isTimer) count--;
    if (this.node?.isConst) count--;
    if (this.node?.isQuest) count--;
    if (this.node?.isThreadSafe) count--;
    count = Math.max(count, 0);
    this.align = `${count * 24 + 12}px`;
  }

  /**
   * Whether this function is documented?
   */
  get hasDocumentation(): boolean {
    if (!this.documentation || !this.node) {
      return false;
    }
    const functions = this.documentation.functions ?? [];

    return functions.some((item) => item.id === this.node!.id);
  }

  toggleDocumentation(): void {
    this.isVisible = !this.isVisible;
  }

  hideDocumentation(): void {
    this.isVisible = false;
  }

  async copyFullName(): Promise<void> {
    if (!this.node || this.node.fullName === this.node.name) {
      return;
    }
    await navigator.clipboard.writeText(this.node.fullName);
  }

  protected async copyPrototype(): Promise<void> {
    if (!this.node) {
      return;
    }
    const code: string = this.fmtService.formatPrototype(this.node);

    await navigator.clipboard.writeText(code);
  }

  protected async copyCall(): Promise<void> {
    if (!this.node) {
      return;
    }
    const code: string = this.fmtService.formatCall(this.node, this.memberOf);

    await navigator.clipboard.writeText(code);
  }

  protected async copySpecial(type: string): Promise<void> {
    if (!this.node) {
      return;
    }
    const code: string = this.fmtService.formatSpecial(type, this.node, this.memberOf);

    await navigator.clipboard.writeText(code);
  }

  protected async copyUrlToClipboard(): Promise<void> {
    if (!this.node) {
      return;
    }
    let uri: string;

    if (this.memberOf) {
      uri = `${this.memberOf.name}#${this.node.name}`;
    } else {
      uri = this.node.name;
    }
    const data: string = `${window.location.origin}/${uri}`;

    await navigator.clipboard.writeText(data);
  }

  private onShowDocumentation([state,]: [boolean, ClassDocumentation | undefined]): void {
    if (!this.hasDocumentation) {
      return;
    }
    this.isVisible = state;
  }

}
