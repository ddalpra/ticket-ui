import { Component, EventEmitter, inject, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, ButtonModule, MenuModule, AvatarModule],
  template: `
    <div class="app-topbar">
      <button pButton icon="pi pi-bars" class="p-button-text p-button-plain mr-3"
              (click)="toggleSidebar.emit()"></button>
      <span class="font-medium text-lg" style="color:#1976d2">{{ greeting }}</span>
      <div class="ml-auto flex align-items-center gap-3">
        <p-avatar [label]="avatarLabel" shape="circle" styleClass="cursor-pointer"
                  [style]="{'background-color':'#1976d2','color':'#fff'}"
                  (click)="menu.toggle($event)"></p-avatar>
        <p-menu #menu [popup]="true" [model]="items"></p-menu>
      </div>
    </div>
  `
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  private auth = inject(AuthService);

  get greeting(): string {
    const p = this.auth.currentProfile;
    return p ? `Ciao, ${p.firstName || p.username}` : '';
  }

  get avatarLabel(): string {
    const p = this.auth.currentProfile;
    return p ? (p.firstName?.[0] ?? p.username[0]).toUpperCase() : '?';
  }

  items: MenuItem[] = [
    { label: 'Profilo', icon: 'pi pi-user',     routerLink: '/profile' },
    { separator: true },
    { label: 'Logout',  icon: 'pi pi-sign-out', command: () => this.auth.logout() },
  ];
}
