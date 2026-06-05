import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { KeycloakService } from 'keycloak-angular';
import { MessageService, ConfirmationService } from 'primeng/api';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthService } from './core/services/auth.service';
import { environment } from '../environments/environment';

function initKeycloak(kc: KeycloakService, auth: AuthService) {
  return async () => {
    await kc.init({
      config: {
        url:      environment.keycloak.url,
        realm:    environment.keycloak.realm,
        clientId: environment.keycloak.clientId,
      },
      initOptions: {
        onLoad:           'login-required',
        checkLoginIframe: false,
        pkceMethod:       'S256',
      },
    });
    await auth.loadProfile();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    KeycloakService,
    MessageService,
    ConfirmationService,
    {
      provide:    APP_INITIALIZER,
      useFactory: initKeycloak,
      deps:       [KeycloakService, AuthService],
      multi:      true,
    },
  ]
};
