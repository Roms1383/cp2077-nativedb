import {Component, Input} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {EMPTY, Observable} from "rxjs";
import {RedDumpService} from "../../../shared/services/red-dump.service";
import {AsyncPipe} from "@angular/common";
import {FunctionSpanComponent} from "../../components/spans/function-span/function-span.component";
import {RedFunctionAst} from "../../../shared/red-ast/red-function.ast";
import {PageService} from "../../../shared/services/page.service";

@Component({
  selector: 'function',
  standalone: true,
  imports: [
    AsyncPipe,
    MatIconModule,
    FunctionSpanComponent,
  ],
  templateUrl: './function.component.html',
  styleUrl: './function.component.scss'
})
export class FunctionComponent {

  function$: Observable<RedFunctionAst | undefined> = EMPTY;

  constructor(private readonly dumpService: RedDumpService,
              private readonly pageService: PageService) {
  }

  @Input()
  set id(id: string) {
    this.pageService.restoreScroll();
    this.function$ = this.dumpService.getFunctionById(+id);
  }

}
