import {Component, EventEmitter, Output} from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatToolbarModule} from "@angular/material/toolbar";
import {NDBIdeThemeComponent} from "../ndb-ide-theme/ndb-ide-theme.component";
import {NDBSearchComponent} from "../ndb-search/ndb-search.component";
import {NDBThemeModeComponent} from "../ndb-theme-mode/ndb-theme-mode.component";
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import {ResponsiveService} from "../../../shared/services/responsive.service";
import {filter} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {NDBSyncDocumentationComponent} from "../ndb-sync-documentation/ndb-sync-documentation.component";

@Component({
  selector: 'ndb-toolbar',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    NDBIdeThemeComponent,
    NDBSearchComponent,
    NDBThemeModeComponent,
    NDBSyncDocumentationComponent
  ],
  templateUrl: './ndb-toolbar.component.html',
  styleUrl: './ndb-toolbar.component.scss'
})
export class NDBToolbarComponent {

  @Output()
  readonly toggle: EventEmitter<void> = new EventEmitter<void>();

  protected isTabsOpen: boolean = true;

  private isMobile: boolean = false;

  constructor(private readonly responsiveService: ResponsiveService,
              private readonly router: Router) {
    this.responsiveService.mobile$.pipe(takeUntilDestroyed()).subscribe(this.onMobile.bind(this));
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(this.onRouteChanged.bind(this));
  }

  toggleTabs(): void {
    this.isTabsOpen = !this.isTabsOpen;
    this.toggle.emit();
  }

  onSearch(): void {
    if (!this.isMobile) {
      return;
    }
    if (this.isTabsOpen) {
      return;
    }
    this.isTabsOpen = true;
    this.toggle.emit();
  }

  private onMobile(isMobile: boolean): void {
    this.isMobile = isMobile;
    this.isTabsOpen = !isMobile;
  }

  private onRouteChanged(): void {
    if (!this.isMobile) {
      return;
    }
    this.isTabsOpen = false;
  }

}
