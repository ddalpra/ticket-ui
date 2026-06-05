import { Component, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface NavItem { label: string; icon: string; route: string; roles?: string[]; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, RouterLinkActive],
  template: `
    <div class="sidebar-logo">
      <i class="pi pi-ticket"></i>
      <span *ngIf="!collapsed">Ticket System</span>
    </div>
    <nav>
      <ul class="sidebar-menu">
        <li *ngFor="let item of visibleItems">
          <a [routerLink]="item.route" routerLinkActive="active" [title]="item.label">
            <i [class]="'pi ' + item.icon"></i>
            <span *ngIf="!collapsed">{{ item.label }}</span>
          </a>
        </li>
      </ul>
    </nav>
  `
})
export class SidebarComponent {
  @Input() collapsed = false;
  private auth = inject(AuthService);

  private all: NavItem[] = [
    { label: 'Dashboard',        icon: 'pi-home',       route: '/dashboard' },
    { label: 'I miei ticket',    icon: 'pi-list',       route: '/tickets',            roles: ['customer'] },
    { label: 'Ticket assegnati', icon: 'pi-inbox',      route: '/tickets/mine',       roles: ['support_l1', 'support_l2'] },
    { label: 'Non assegnati',    icon: 'pi-inbox',      route: '/tickets/unassigned', roles: ['support_l1', 'support_l2', 'supervisor'] },
    { label: 'Tutti i ticket',   icon: 'pi-list',       route: '/tickets/center',     roles: ['supervisor'] },
    { label: 'Utenti',           icon: 'pi-users',      route: '/users',              roles: ['supervisor'] },
    { label: 'Aziende',          icon: 'pi-building',   route: '/companies',          roles: ['supervisor'] },
    { label: 'Centri servizi',   icon: 'pi-map-marker', route: '/service-centers',    roles: ['supervisor'] },
    { label: 'Profilo',          icon: 'pi-user',       route: '/profile' },
  ];

  get visibleItems(): NavItem[] {
    return this.all.filter(i => !i.roles || i.roles.some(r => this.auth.hasRole(r as any)));
  }
}
