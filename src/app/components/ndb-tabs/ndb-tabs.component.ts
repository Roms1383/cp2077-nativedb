import {Component, HostListener, Renderer2} from '@angular/core';
import {MatTabsModule} from "@angular/material/tabs";
import {combineLatest, map, Observable, take} from "rxjs";
import {MatIconModule} from "@angular/material/icon";
import {AsyncPipe, NgTemplateOutlet} from "@angular/common";
import {RouterLink} from "@angular/router";
import {SearchService} from "../../../shared/services/search.service";
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {MatDividerModule} from "@angular/material/divider";
import {SettingsService} from "../../../shared/services/settings.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

export interface TabItemNode {
  readonly id: number;
  readonly uri: string;
  readonly name: string;
  readonly isEmpty: boolean;
}

interface TabItem {
  readonly icon: string;
  readonly alt: string;
  readonly nodes: TabItemNode[];
}

@Component({
  selector: 'ndb-tabs',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    NgTemplateOutlet,
    AsyncPipe,
    RouterLink,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    MatDividerModule
  ],
  templateUrl: './ndb-tabs.component.html',
  styleUrl: './ndb-tabs.component.scss'
})
export class NDBTabsComponent {

  readonly tabs$: Observable<TabItem[]>;
  readonly skeletons: TabItem[] = [
    {icon: 'class', alt: 'Classes', nodes: []},
    {icon: 'struct', alt: 'Structs', nodes: []},
    {icon: 'function', alt: 'Global functions', nodes: []},
    {icon: 'enum', alt: 'Enums', nodes: []},
    {icon: 'bitfield', alt: 'Bitfields', nodes: []},
  ];

  width: string = '320px';

  private isResizing: boolean = false;

  constructor(private readonly renderer: Renderer2,
              private readonly settingsService: SettingsService,
              searchService: SearchService) {
    this.settingsService.tabsWidth$.pipe(take(1), takeUntilDestroyed()).subscribe(this.onWidthLoaded.bind(this));
    this.tabs$ = combineLatest([
      searchService.enums$,
      searchService.bitfields$,
      searchService.classes$,
      searchService.structs$,
      searchService.functions$,
      settingsService.mergeObject$,
    ]).pipe(
      map(([
             enums,
             bitfields,
             classes,
             structs,
             functions,
             merge
           ]) => {
        const objects: TabItem[] = [];

        if (!merge) {
          objects.push(
            {icon: 'class', alt: 'Classes', nodes: classes},
            {icon: 'struct', alt: 'Structs', nodes: structs}
          );
        } else {
          const nodes: TabItemNode[] = [...classes, ...structs];

          nodes.sort((a, b) => a.name.localeCompare(b.name));
          objects.push(
            {icon: '', alt: 'Classes & structs', nodes: nodes},
          );
        }
        return [
          ...objects,
          {icon: 'function', alt: 'Global functions', nodes: functions},
          {icon: 'enum', alt: 'Enums', nodes: enums},
          {icon: 'bitfield', alt: 'Bitfields', nodes: bitfields},
        ];
      })
    );
  }

  protected onStartResizing(): void {
    this.isResizing = true;
    this.renderer.setStyle(document.body, 'user-select', 'none');
    this.renderer.setStyle(document.body, 'cursor', 'col-resize');
  }

  @HostListener('window:mousemove', ['$event'])
  protected onResizing(event: MouseEvent): void {
    if (!this.isResizing) {
      return;
    }
    if (event.x < 320 || event.x > document.body.clientWidth / 2) {
      return;
    }
    this.width = `${event.x}px`;
  }

  @HostListener('window:mouseup')
  protected onStopResizing(): void {
    if (!this.isResizing) {
      return;
    }
    this.renderer.removeStyle(document.body, 'user-select');
    this.renderer.removeStyle(document.body, 'cursor');
    this.settingsService.updateTabsWidth(parseInt(this.width));
    this.isResizing = false;
  }

  protected onRestoreDefault(): void {
    this.width = '320px';
    this.settingsService.updateTabsWidth(320);
  }

  private onWidthLoaded(width: number): void {
    this.width = `${width}px`;
  }

}
