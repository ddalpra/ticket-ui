import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TicketService } from '../../core/services/ticket.service';
import { CompanyService } from '../../core/services/company.service';
import { AuthService } from '../../core/services/auth.service';
import { Ticket, CreateTicketDto, ServiceCenter } from '../../shared/models';
import { StateJobLabelPipe, StateJobClassPipe, PriorityLabelPipe, PriorityClassPipe } from '../../shared/pipes/labels.pipe';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink, FormsModule,
            TableModule, ButtonModule, InputTextModule, InputTextareaModule,
            DropdownModule, DialogModule, CardModule, TooltipModule,
            StateJobLabelPipe, StateJobClassPipe, PriorityLabelPipe, PriorityClassPipe],
  template: `
    <div class="page-header flex align-items-center justify-content-between">
      <div><h2>{{ pageTitle }}</h2><p>{{ filtered.length }} ticket</p></div>
      <button *ngIf="auth.isCustomer" pButton icon="pi pi-plus"
              label="Nuovo ticket" (click)="showCreate = true"></button>
    </div>

    <!-- Filtri -->
    <p-card styleClass="mb-3">
      <div class="flex flex-wrap gap-3 align-items-center">
        <span class="p-input-icon-left flex-1" style="min-width:200px">
          <i class="pi pi-search"></i>
          <input pInputText [(ngModel)]="filterText" placeholder="Cerca titolo..."
                 (input)="applyFilter()" class="w-full"/>
        </span>
        <p-dropdown [options]="prioOpts" [(ngModel)]="filterPrio" placeholder="Priorità"
                    [showClear]="true" (onChange)="applyFilter()"
                    optionLabel="label" optionValue="value"
                    [style]="{'min-width':'130px'}"></p-dropdown>
        <p-dropdown [options]="stateOpts" [(ngModel)]="filterState" placeholder="Stato"
                    [showClear]="true" (onChange)="applyFilter()"
                    optionLabel="label" optionValue="value"
                    [style]="{'min-width':'170px'}"></p-dropdown>
        <button pButton icon="pi pi-refresh" class="p-button-outlined"
                pTooltip="Aggiorna" (click)="load()"></button>
      </div>
    </p-card>

    <!-- Tabella -->
    <p-card>
      <p-table [value]="filtered" [loading]="loading" [rows]="15" [paginator]="true"
               [rowsPerPageOptions]="[10,15,25,50]" dataKey="id"
               styleClass="p-datatable-sm p-datatable-gridlines" responsiveLayout="scroll">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="title">Titolo <p-sortIcon field="title"></p-sortIcon></th>
            <th>Azienda</th><th>Centro</th>
            <th pSortableColumn="state_job">Stato <p-sortIcon field="state_job"></p-sortIcon></th>
            <th pSortableColumn="priority">Priorità <p-sortIcon field="priority"></p-sortIcon></th>
            <th>Assegnato</th>
            <th pSortableColumn="data_creation">Data <p-sortIcon field="data_creation"></p-sortIcon></th>
            <th style="width:90px">Azioni</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-t>
          <tr (click)="goDetail(t.id)" style="cursor:pointer">
            <td class="font-medium" style="color:#1976d2">{{ t.title }}</td>
            <td>{{ t.edges?.company?.ragione_sociale ?? '—' }}</td>
            <td>{{ t.edges?.service_center?.nome ?? '—' }}</td>
            <td>
              <span class="border-round px-2 py-1 text-xs font-semibold"
                    [class]="t.state_job | stateJobClass">
                {{ t.state_job | stateJobLabel }}
              </span>
            </td>
            <td>
              <span class="border-round px-2 py-1 text-xs font-semibold"
                    [class]="t.priority | priorityClass">
                {{ t.priority | priorityLabel }}
              </span>
            </td>
            <td>{{ t.edges?.assigned_to?.username ?? '—' }}</td>
            <td class="text-500 text-sm">{{ t.data_creation | date:'dd/MM/yy HH:mm' }}</td>
            <td (click)="$event.stopPropagation()">
              <button pButton icon="pi pi-eye" class="p-button-text p-button-sm"
                      [routerLink]="['/tickets', t.id]" pTooltip="Dettaglio"></button>
              <button *ngIf="auth.isSupport && t.state_job === 'APERTA' && !t.edges?.assigned_to"
                      pButton icon="pi pi-user-plus"
                      class="p-button-text p-button-sm p-button-success"
                      pTooltip="Prendi in carico" (click)="take(t)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="8" class="text-center text-500 py-5">
            <i class="pi pi-inbox text-4xl mb-2 block" style="color:#ccc"></i>
            Nessun ticket trovato
          </td></tr>
        </ng-template>
      </p-table>
    </p-card>

    <!-- Dialog nuovo ticket -->
    <p-dialog header="Nuovo ticket" [(visible)]="showCreate" [modal]="true"
              [style]="{width:'520px'}" [draggable]="false">
      <div class="flex flex-column gap-3 pt-2">
        <div class="flex flex-column gap-1">
          <label class="font-medium text-sm">Titolo *</label>
          <input pInputText [(ngModel)]="newDto.title" maxlength="150"
                 placeholder="Descrizione breve del problema"/>
        </div>
        <div class="flex flex-column gap-1">
          <label class="font-medium text-sm">Descrizione *</label>
          <textarea pInputTextarea [(ngModel)]="newDto.question" rows="5"
                    placeholder="Descrivi il problema in dettaglio..." class="w-full"></textarea>
        </div>
        <div class="flex flex-column gap-1">
          <label class="font-medium text-sm">Centro servizi *</label>
          <p-dropdown [options]="serviceCenters" [(ngModel)]="newDto.service_center_id"
                      optionLabel="nome" optionValue="id"
                      placeholder="Seleziona centro" class="w-full"></p-dropdown>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Annulla" class="p-button-text" (click)="showCreate = false"></button>
        <button pButton label="Crea ticket" icon="pi pi-check" [loading]="saving"
                [disabled]="!newDto.title || !newDto.question || !newDto.service_center_id"
                (click)="create()"></button>
      </ng-template>
    </p-dialog>
  `
})
export class TicketListComponent implements OnInit {
  private svc    = inject(TicketService);
  private cSvc   = inject(CompanyService);
  private msg    = inject(MessageService);
  private router = inject(Router);
  auth = inject(AuthService);

  loading = true; saving = false; showCreate = false;
  tickets: Ticket[] = []; filtered: Ticket[] = [];
  serviceCenters: ServiceCenter[] = [];
  newDto: CreateTicketDto = { title: '', question: '', service_center_id: '' };
  filterText = ''; filterPrio = ''; filterState = '';

  prioOpts = [
    { label: 'Bassa', value: 'LOW' },
    { label: 'Media', value: 'MEDIUM' },
    { label: 'Alta',  value: 'HIGH' },
  ];
  stateOpts = [
    { label: 'Aperta',            value: 'APERTA' },
    { label: 'Presa in carico',   value: 'PRESA_IN_CARICO' },
    { label: 'In attesa cliente', value: 'IN_ATTESA_CLIENTE' },
    { label: 'In attesa CS',      value: 'IN_ATTESA_CENTRO_SERVIZI' },
    { label: 'Chiusa',            value: 'CHIUSA' },
  ];

  get pageTitle(): string {
    if (this.auth.isSupervisor) return 'Tutti i ticket del centro';
    if (this.auth.isSupport)    return 'Ticket assegnati';
    return 'I miei ticket';
  }

  ngOnInit(): void {
    this.load();
    if (this.auth.isCustomer)
      this.cSvc.listServiceCenters().subscribe(sc => this.serviceCenters = sc);
  }

  load(): void {
    this.loading = true;
    const obs = this.auth.isSupervisor ? this.svc.listCenter()
              : this.auth.isSupport    ? this.svc.listMine()
              : this.svc.list();
    obs.subscribe({
      next: t => { this.tickets = t; this.applyFilter(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    this.filtered = this.tickets.filter(t =>
      (!this.filterText  || t.title.toLowerCase().includes(this.filterText.toLowerCase())) &&
      (!this.filterPrio  || t.priority === this.filterPrio) &&
      (!this.filterState || t.state_job === this.filterState)
    );
  }

  create(): void {
    this.saving = true;
    this.svc.create(this.newDto).subscribe({
      next: t => {
        this.tickets.unshift(t); this.applyFilter();
        this.msg.add({ severity: 'success', summary: 'Ticket creato', detail: t.title });
        this.showCreate = false;
        this.newDto = { title: '', question: '', service_center_id: '' };
        this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }

  take(t: Ticket): void {
    this.svc.take(t.id).subscribe({
      next: u => {
        const i = this.tickets.findIndex(x => x.id === t.id);
        if (i >= 0) this.tickets[i] = u;
        this.applyFilter();
        this.msg.add({ severity: 'success', summary: 'Preso in carico', detail: t.title });
      }
    });
  }

  goDetail(id: string): void { this.router.navigate(['/tickets', id]); }
}
