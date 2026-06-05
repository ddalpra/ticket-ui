import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AuthService } from '../../core/services/auth.service';
import { RoleLabelPipe } from '../../shared/pipes/labels.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgFor, NgIf, CardModule, AvatarModule, ButtonModule, DividerModule, RoleLabelPipe],
  template: `
    <div class="page-header">
      <h2>Profilo</h2>
      <p>Le tue informazioni personali</p>
    </div>

    <div class="grid" *ngIf="auth.currentProfile as p">
      <div class="col-12 md:col-4">
        <p-card styleClass="text-center">
          <p-avatar [label]="avatarLabel" size="xlarge" shape="circle"
                    [style]="{'background-color':'#1976d2','color':'#fff',
                               'width':'96px','height':'96px','font-size':'2.5rem'}">
          </p-avatar>
          <h3 style="margin:.75rem 0 .25rem">{{ p.firstName }} {{ p.lastName }}</h3>
          <p style="color:#666;margin:0">{{ p.username }}</p>
          <p-divider></p-divider>
          <button pButton label="Logout" icon="pi pi-sign-out"
                  class="p-button-outlined p-button-danger w-full"
                  (click)="auth.logout()"></button>
        </p-card>
      </div>

      <div class="col-12 md:col-8">
        <p-card header="Informazioni account">
          <div class="flex flex-column gap-4">
            <div class="grid">
              <div class="col-6">
                <label style="color:#888;font-size:.75rem;font-weight:600;text-transform:uppercase;display:block;margin-bottom:.25rem">Nome</label>
                <span class="font-medium">{{ p.firstName || '—' }}</span>
              </div>
              <div class="col-6">
                <label style="color:#888;font-size:.75rem;font-weight:600;text-transform:uppercase;display:block;margin-bottom:.25rem">Cognome</label>
                <span class="font-medium">{{ p.lastName || '—' }}</span>
              </div>
              <div class="col-6 mt-3">
                <label style="color:#888;font-size:.75rem;font-weight:600;text-transform:uppercase;display:block;margin-bottom:.25rem">Username</label>
                <span class="font-medium">{{ p.username }}</span>
              </div>
              <div class="col-6 mt-3">
                <label style="color:#888;font-size:.75rem;font-weight:600;text-transform:uppercase;display:block;margin-bottom:.25rem">Email</label>
                <span class="font-medium">{{ p.email || '—' }}</span>
              </div>
            </div>

            <p-divider></p-divider>

            <div>
              <label style="color:#888;font-size:.75rem;font-weight:600;text-transform:uppercase;display:block;margin-bottom:.5rem">
                Ruoli assegnati
              </label>
              <div class="flex gap-2 flex-wrap">
                <span *ngFor="let r of appRoles"
                      class="border-round px-2 py-1 text-xs font-semibold badge-active">
                  {{ r | roleLabel }}
                </span>
              </div>
            </div>

            <p-divider></p-divider>

            <div>
              <label style="color:#888;font-size:.75rem;font-weight:600;text-transform:uppercase;display:block;margin-bottom:.25rem">
                ID Keycloak
              </label>
              <span style="font-size:.8rem;color:#999;font-family:monospace">{{ p.id }}</span>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);

  get avatarLabel(): string {
    const p = this.auth.currentProfile;
    return p ? (p.firstName?.[0] ?? p.username[0]).toUpperCase() : '?';
  }

  get appRoles(): string[] {
    const allowed = ['customer', 'support_l1', 'support_l2', 'supervisor'];
    return (this.auth.currentProfile?.roles ?? []).filter(r => allowed.includes(r));
  }

  ngOnInit(): void { this.auth.loadProfile(); }
}
