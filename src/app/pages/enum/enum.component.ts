import {Component, Input} from '@angular/core';
import {RedDumpService} from "../../../shared/services/red-dump.service";
import {EMPTY, Observable} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {RedEnumAst} from "../../../shared/red-ast/red-enum.ast";
import {PageService} from "../../../shared/services/page.service";
import {NDBTitleBarComponent} from "../../components/ndb-title-bar/ndb-title-bar.component";
import {RecentVisitService} from "../../../shared/services/recent-visit.service";

@Component({
  selector: 'enum',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    AsyncPipe,
    NDBTitleBarComponent
  ],
  templateUrl: './enum.component.html',
  styleUrl: './enum.component.scss'
})
export class EnumComponent {

  enum$: Observable<RedEnumAst | undefined> = EMPTY;

  constructor(private readonly dumpService: RedDumpService,
              private readonly pageService: PageService,
              private readonly recentVisitService: RecentVisitService) {
  }

  @Input()
  set id(id: string) {
    this.pageService.restoreScroll();
    this.recentVisitService.pushLastVisit(+id);
    this.enum$ = this.dumpService.getEnumById(+id);
  }

  protected async copyClipboard(node: RedEnumAst, key: string): Promise<void> {
    let data: string = `${node.name}.${key}`;

    await navigator.clipboard.writeText(data);
  }

}
