import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RedDumpService} from "../../../shared/services/red-dump.service";
import {combineLatest, map, Observable} from "rxjs";
import {RedFunctionAst} from "../../../shared/red-ast/red-function.ast";
import {AsyncPipe} from "@angular/common";
import {FunctionSpanComponent} from "../../components/spans/function-span/function-span.component";
import {MatIconModule} from "@angular/material/icon";
import {NDBTitleBarComponent} from "../../components/ndb-title-bar/ndb-title-bar.component";
import {MatDividerModule} from "@angular/material/divider";
import {ResponsiveService} from "../../../shared/services/responsive.service";
import {MatTooltip} from "@angular/material/tooltip";

interface FunctionsData {
  readonly functions: RedFunctionAst[];
  readonly isMobile: boolean;
}

@Component({
  selector: 'ndb-page-functions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    MatTooltip,
    MatIconModule,
    MatDividerModule,
    FunctionSpanComponent,
    NDBTitleBarComponent
  ],
  templateUrl: './functions.component.html',
  styleUrl: './functions.component.scss'
})
export class FunctionsComponent {

  readonly data$: Observable<FunctionsData>;

  readonly skeletons: string[] = [
    'AIInstantiateObject() → Void',
    'AIInstantiatePrototype() → Void',
    'AIReleaseObject() → Void',
    'AT_AddATID(widget: wref<inkWidget>, atid: script_ref<String>) → Void',
    'Abs(a: Int32) → Int32',
    'AbsF(a: Float) → Float',
    'AcosF(a: Float) → Float',
    'ActivateTickForTransformAnimator(entityID: entEntityID, componentName: CName, activate: Bool) → Void',
    'AddToInventory(itemID: String, quantity: Int32) → Void',
    'AngleApproach(target: Float, cur: Float, step: Float) → Float',
    'AngleDistance(target: Float, current: Float) → Float',
    'AngleNormalize(a: Float) → Float',
    'AngleNormalize180(a: Float) → Float',
    'AreDebugContextsEnabled() → Bool',
    'ArmouryEquipWeapon(itemID: gameItemID, QuickslotID: Int32) → Void',
    'ArraySortFloats() → Void',
    'ArraySortInts() → Void'
  ];

  constructor(private readonly dumpService: RedDumpService,
              private readonly responsiveService: ResponsiveService) {
    this.data$ = combineLatest([
      this.dumpService.functions$,
      this.responsiveService.mobile$
    ]).pipe(
      map(([functions, isMobile]) => {
        return {
          functions,
          isMobile
        };
      })
    );
  }

}
