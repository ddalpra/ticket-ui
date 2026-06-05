import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const authGuard: CanActivateFn = async (_route, state) => {
  const kc = inject(KeycloakService);
  if (await kc.isLoggedIn()) return true;
  await kc.login({ redirectUri: window.location.origin + state.url });
  return false;
};

export const roleGuard = (roles: string[]): CanActivateFn => async () => {
  const kc     = inject(KeycloakService);
  const router = inject(Router);
  if (roles.some(r => kc.getUserRoles().includes(r))) return true;
  router.navigate(['/forbidden']);
  return false;
};
