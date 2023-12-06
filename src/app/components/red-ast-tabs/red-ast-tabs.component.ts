import {Component} from '@angular/core';
import {MatTabsModule} from "@angular/material/tabs";
import {combineLatest, map, Observable} from "rxjs";
import {MatIconModule} from "@angular/material/icon";
import {AsyncPipe, NgTemplateOutlet} from "@angular/common";
import {RouterLink} from "@angular/router";
import {SearchService} from "../../../shared/services/search-service";

interface RedNode {
  readonly id: number;
  readonly name: string;
}

interface TabItem {
  readonly uri: string;
  readonly icon: string;
  readonly alt: string;
  readonly nodes: RedNode[];
}

@Component({
  selector: 'red-ast-tabs',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    NgTemplateOutlet,
    AsyncPipe,
    RouterLink
  ],
  templateUrl: './red-ast-tabs.component.html',
  styleUrl: './red-ast-tabs.component.scss'
})
export class RedAstTabsComponent {

  readonly tabs: Observable<TabItem[]>;

  constructor(searchService: SearchService) {
    this.tabs = combineLatest([
      searchService.enums$,
      searchService.bitfields$,
      searchService.classes$,
      searchService.structs$,
      searchService.functions$,
    ]).pipe(
      map(([enums, bitfields, classes, structs, functions]) => {
        return [
          {uri: 'e', icon: 'enum', alt: 'Enums', nodes: enums},
          {uri: 'b', icon: 'bitfield', alt: 'Bitfields', nodes: bitfields},
          {uri: 'c', icon: 'class', alt: 'Classes', nodes: classes},
          {uri: 's', icon: 'struct', alt: 'Structs', nodes: structs},
          {uri: 'f', icon: 'function', alt: 'Global functions', nodes: functions},
        ];
      })
    );
  }

}
