import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatDividerModule} from "@angular/material/divider";
import {FunctionSpanComponent} from "../../components/spans/function-span/function-span.component";
import {RedFunctionAst} from "../../../shared/red-ast/red-function.ast";
import {map, Observable, OperatorFunction, pipe} from "rxjs";
import {RedDumpService} from "../../../shared/services/red-dump.service";
import {AsyncPipe} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {cyrb53} from "../../../shared/string";
import {PageService} from "../../../shared/services/page.service";
import {MatChipsModule} from "@angular/material/chips";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDialog} from "@angular/material/dialog";
import {NDBGuidelinesDialogComponent} from "../../components/ndb-guidelines-dialog/ndb-guidelines-dialog.component";

@Component({
  selector: 'ndb-page-readme',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterLink,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    FunctionSpanComponent
  ],
  templateUrl: './readme.component.html',
  styleUrl: './readme.component.scss'
})
export class ReadmeComponent implements OnInit {

  readonly getGameInstance$: Observable<RedFunctionAst | undefined>;
  readonly addFact$: Observable<RedFunctionAst | undefined>;
  readonly id: number = cyrb53('ScriptGameInstance');

  constructor(private readonly dumpService: RedDumpService,
              private readonly pageService: PageService,
              private readonly dialog: MatDialog) {
    this.getGameInstance$ = this.dumpService.functions$.pipe(this.getGameInstance());
    this.addFact$ = this.dumpService.functions$.pipe(this.getAddFact());
  }

  ngOnInit(): void {
    this.pageService.restoreScroll();
  }

  openGuidelines(): void {
    this.dialog.open(NDBGuidelinesDialogComponent, NDBGuidelinesDialogComponent.Config);
  }

  private getGameInstance(): OperatorFunction<RedFunctionAst[], RedFunctionAst | undefined> {
    return pipe(
      map((functions) => {
        return functions.find((func) => func.name === 'GetGameInstance');
      })
    );
  }

  private getAddFact(): OperatorFunction<RedFunctionAst[], RedFunctionAst | undefined> {
    return pipe(
      map((functions) => {
        return functions.find((func) => func.name === 'AddFact');
      })
    );
  }

}
