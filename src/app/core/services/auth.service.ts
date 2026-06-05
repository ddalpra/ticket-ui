import { Injectable, inject, signal } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { UserRole } from '../../shared/models';

export interface UserProfile {
  id: string; username: string; email: string;
  firstName: string; lastName: string; roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private kc = inject(KeycloakService);
  profile = signal<UserProfile | null>(null);

  async loadProfile(): Promise<void> {
    try {
      const p = await this.kc.loadUserProfile();
      this.profile.set({
        id: p.id ?? '', username: p.username ?? '',
        email: p.email ?? '', firstName: p.firstName ?? '',
        lastName: p.lastName ?? '', roles: this.kc.getUserRoles()
      });
    } catch { this.profile.set(null); }
  }

  get currentProfile() { return this.profile(); }

  hasRole(r: UserRole): boolean  { return this.kc.isUserInRole(r); }
  hasAnyRole(roles: UserRole[]): boolean { return roles.some(r => this.kc.isUserInRole(r)); }

  get isCustomer():   boolean { return this.hasRole('customer'); }
  get isSupportL1():  boolean { return this.hasRole('support_l1'); }
  get isSupportL2():  boolean { return this.hasRole('support_l2'); }
  get isSupervisor(): boolean { return this.hasRole('supervisor'); }
  get isSupport():    boolean { return this.hasAnyRole(['support_l1', 'support_l2', 'supervisor']); }

  logout(): void { this.kc.logout(window.location.origin); }
}
