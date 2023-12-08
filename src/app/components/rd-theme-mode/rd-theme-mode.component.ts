import {Component, DestroyRef, OnInit, Renderer2} from '@angular/core';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {Theme, ThemeService} from "../../../shared/services/theme.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'rd-theme-mode',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './rd-theme-mode.component.html',
  styleUrl: './rd-theme-mode.component.scss'
})
export class RdThemeModeComponent implements OnInit {

  private theme: Theme = 'light-theme';

  constructor(private readonly themeService: ThemeService,
              private readonly renderer: Renderer2,
              private readonly dr: DestroyRef) {
  }

  get themeModeIcon(): string {
    return (this.theme === 'light-theme') ? 'dark_mode' : 'light_mode';
  }

  get themeModeTitle(): string {
    return `Switch to ${(this.theme === 'light-theme') ? 'dark' : 'light'} mode`;
  }

  ngOnInit(): void {
    this.themeService.onThemeChanged.pipe(takeUntilDestroyed(this.dr)).subscribe(this.onThemeChanged.bind(this));
    this.themeService.load();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  private onThemeChanged(theme: Theme): void {
    this.theme = theme;
    if (theme === 'light-theme') {
      this.renderer.removeClass(document.body, 'dark-theme');
    } else {
      this.renderer.addClass(document.body, theme);
    }
  }
}
