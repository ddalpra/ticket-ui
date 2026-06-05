import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { PasswordModule } from 'primeng/password';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { UserService } from '../../core/services/user.service';
import { CompanyService } from '../../core/services/company.service';
import { User, Company, ServiceCenter, RegisterCustomerDto, RegisterSupportDto } from '../../shared/models';
import { RoleLabelPipe } from '../../shared/pipes/labels.pipe';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TableModule, ButtonModule, DialogModule,
            InputTextModule, DropdownModule, CardModule, TabViewModule,
            PasswordModule, TooltipModule, RoleLabelPipe],
  template: `
    <div class="page-header flex align-items-center justify-content-between">
      <div><h2>Gestione utenti</h2><p>{{ users.length }} utenti nel centro</p></div>
      <button pButton icon="pi pi-plus" label="Nuovo utente" (click)="showDialog = true"></button>
    </div>

    <p-card>
      <p-table [value]="users" [loading]="loading" [rows]="15" [paginator]="true"
               dataKey="id" styleClass="p-datatable-sm p-datatable-gridlines" responsiveLayout="scroll">
        <ng-template pTemplate="header">
          <tr>
            <th>Username</th><th>Nome</th><th>Email</th>
            <th>Ruolo</th><th>Azienda/Centro</th><th>Stato</th><th style="width:70px">Azioni</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-u>
          <tr>
            <td class="font-medium">{{ u.username }}</td>
            <td>{{ u.first_name }} {{ u.last_name }}</td>
            <td>{{ u.email }}</td>
            <td>
              <span class="border-round px-2 py-1 text-xs font-semibold badge-active">
                {{ u.role | roleLabel }}
              </span>
            </td>
            <td>{{ u.edges?.company?.ragione_sociale ?? u.edges?.service_center?.nome ?? '—' }}</td>
            <td>
              <span class="border-round px-2 py-1 text-xs font-semibold"
                    [class]="u.active ? 'badge-active' : 'badge-inactive'">
                {{ u.active ? 'Attivo' : 'Disabilitato' }}
              </span>
            </td>
            <td>
              <button pButton [icon]="u.active ? 'pi pi-ban' : 'pi pi-check'"
                      class="p-button-text p-button-sm"
                      [pTooltip]="u.active ? 'Disabilita' : 'Abilita'"
                      (click)="toggleActive(u)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="7" class="text-center text-500 py-5">Nessun utente trovato</td></tr>
        </ng-template>
      </p-table>
    </p-card>

    <!-- Dialog registrazione -->
    <p-dialog header="Registra nuovo utente" [(visible)]="showDialog"
              [modal]="true" [style]="{width:'560px'}" [draggable]="false">
      <p-tabView>
        <!-- Tab Customer -->
        <p-tabPanel header="Customer">
          <div class="flex flex-column gap-3 pt-2">
            <div class="grid">
              <div class="col-6 flex flex-column gap-1">
                <label class="font-medium text-sm">Nome *</label>
                <input pInputText [(ngModel)]="cDto.first_name"/>
              </div>
              <div class="col-6 flex flex-column gap-1">
                <label class="font-medium text-sm">Cognome *</label>
                <input pInputText [(ngModel)]="cDto.last_name"/>
              </div>
            </div>
            <div class="flex flex-column gap-1">
              <label class="font-medium text-sm">Username *</label>
              <input pInputText [(ngModel)]="cDto.username"/>
            </div>
            <div class="flex flex-column gap-1">
              <label class="font-medium text-sm">Email *</label>
              <input pInputText type="email" [(ngModel)]="cDto.email"/>
            </div>
            <div class="flex flex-column gap-1">
              <label class="font-medium text-sm">Password *</label>
              <p-password [(ngModel)]="cDto.password" [toggleMask]="true" styleClass="w-full"></p-password>
            </div>
            <div class="flex flex-column gap-1">
              <label class="font-medium text-sm">Azienda *</label>
              <p-dropdown [options]="companies" [(ngModel)]="cDto.company_id"
                          optionLabel="ragione_sociale" optionValue="id"
                          placeholder="Seleziona azienda" class="w-full"></p-dropdown>
            </div>
            <div class="flex justify-content-end gap-2 pt-2">
              <button pButton label="Annulla" class="p-button-text" (click)="showDialog = false"></button>
              <button pButton label="Registra" icon="pi pi-check"
                      [loading]="saving" (click)="regCustomer()"></button>
            </div>
          </div>
        </p-tabPanel>

        <!-- Tab Supporto -->
        <p-tabPanel header="Supporto / Supervisore">
          <div class="flex flex-column gap-3 pt-2">
            <div class="grid">
              <div class="col-6 flex flex-column gap-1">
                <label class="font-medium text-sm">Nome *</label>
                <input pInputText [(ngModel)]="sDto.first_name"/>
              </div>
              <div class="col-6 flex flex-column gap-1">
                <label class="font-medium text-sm">Cognome *</label>
                <input pInputText [(ngModel)]="sDto.last_name"/>
              </div>
            </div>
            <div class="flex flex-column gap-1">
              <label class="font-medium text-sm">Username *</label>
              <input pInputText [(ngModel)]="sDto.username"/>
            </div>
            <div class="flex flex-column gap-1">
              <label class="font-medium text-sm">Email *</label>
              <input pInputText type="email" [(ngModel)]="sDto.email"/>
            </div>
            <div class="flex flex-column gap-1">
              <label class="font-medium text-sm">Password *</label>
              <p-password [(ngModel)]="sDto.password" [toggleMask]="true" styleClass="w-full"></p-password>
            </div>
            <div class="flex flex-column gap-1">
              <label class="font-medium text-sm">Ruolo *</label>
              <p-dropdown [options]="suppRoles" [(ngModel)]="sDto.role"
                          optionLabel="label" optionValue="value" class="w-full"></p-dropdown>
            </div>
            <div class="flex flex-column gap-1">
              <label class="font-medium text-sm">Centro servizi *</label>
              <p-dropdown [options]="serviceCenters" [(ngModel)]="sDto.service_center_id"
                          optionLabel="nome" optionValue="id" class="w-full"></p-dropdown>
            </div>
            <div class="flex justify-content-end gap-2 pt-2">
              <button pButton label="Annulla" class="p-button-text" (click)="showDialog = false"></button>
              <button pButton label="Registra" icon="pi pi-check"
                      [loading]="saving" (click)="regSupport()"></button>
            </div>
          </div>
        </p-tabPanel>
      </p-tabView>
    </p-dialog>
  `
})
export class UsersComponent implements OnInit {
  private userSvc = inject(UserService);
  private cSvc    = inject(CompanyService);
  private msg     = inject(MessageService);

  loading = false; saving = false; showDialog = false;
  users: User[] = []; companies: Company[] = []; serviceCenters: ServiceCenter[] = [];

  cDto: RegisterCustomerDto = { username: '', email: '', first_name: '', last_name: '', password: '', company_id: '' };
  sDto: RegisterSupportDto  = { username: '', email: '', first_name: '', last_name: '', password: '', role: 'support_l1', service_center_id: '' };

  suppRoles = [
    { label: 'Supporto L1', value: 'support_l1' },
    { label: 'Supporto L2', value: 'support_l2' },
    { label: 'Supervisore', value: 'supervisor' },
  ];

  ngOnInit(): void {
    this.load();
    this.cSvc.listCompanies().subscribe(c => this.companies = c);
    this.cSvc.listServiceCenters().subscribe(sc => this.serviceCenters = sc);
  }

  load(): void {
    this.loading = true;
    this.userSvc.listCenterUsers().subscribe({
      next: u => { this.users = u; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  regCustomer(): void {
    this.saving = true;
    this.userSvc.registerCustomer(this.cDto).subscribe({
      next: u => {
        this.users.push(u);
        this.msg.add({ severity: 'success', summary: 'Customer registrato', detail: u.username });
        this.showDialog = false; this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }

  regSupport(): void {
    this.saving = true;
    this.userSvc.registerSupport(this.sDto).subscribe({
      next: u => {
        this.users.push(u);
        this.msg.add({ severity: 'success', summary: 'Utente registrato', detail: u.username });
        this.showDialog = false; this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }

  toggleActive(u: User): void {
    this.userSvc.setActive(u.id, !u.active).subscribe({
      next: upd => {
        const i = this.users.findIndex(x => x.id === u.id);
        if (i >= 0) this.users[i] = upd;
        this.msg.add({ severity: 'success', summary: upd.active ? 'Utente abilitato' : 'Utente disabilitato' });
      }
    });
  }
}
