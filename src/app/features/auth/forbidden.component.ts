import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  template: `
    <div style="min-height:60vh;display:flex;flex-direction:column;
                align-items:center;justify-content:center;gap:1rem;text-align:center">
      <i class="pi pi-lock" style="font-size:4rem;color:#bbb"></i>
      <h2 style="margin:0">Accesso negato</h2>
      <p style="color:#666;margin:0">Non hai i permessi per visualizzare questa pagina.</p>
      <a pButton label="Torna alla dashboard" icon="pi pi-home" routerLink="/dashboard"></a>
    </div>
  `
})
export class ForbiddenComponent {}
