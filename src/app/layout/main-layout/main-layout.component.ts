import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [NgClass, RouterOutlet, ToastModule, SidebarComponent, TopbarComponent],
  template: `
    <p-toast position="top-right"></p-toast>
    <div class="app-layout">
      <aside class="app-sidebar" [ngClass]="{ collapsed: sidebarCollapsed() }">
        <app-sidebar [collapsed]="sidebarCollapsed()"></app-sidebar>
      </aside>
      <div class="app-main">
        <app-topbar (toggleSidebar)="toggleSidebar()"></app-topbar>
        <main class="app-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);
  toggleSidebar(): void { this.sidebarCollapsed.update(v => !v); }
}
