import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { FileUploadModule } from 'primeng/fileupload';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { TicketService } from '../../core/services/ticket.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Ticket, User, TicketPriority, StateJob } from '../../shared/models';
import { StateJobLabelPipe, StateJobClassPipe, PriorityLabelPipe, PriorityClassPipe } from '../../shared/pipes/labels.pipe';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink, FormsModule,
            CardModule, ButtonModule, TimelineModule, InputTextareaModule,
            DropdownModule, DividerModule, FileUploadModule, SkeletonModule, TooltipModule,
            StateJobLabelPipe, StateJobClassPipe, PriorityLabelPipe, PriorityClassPipe],
  template: `
    <div *ngIf="loading" class="flex justify-content-center py-8">
      <i class="pi pi-spin pi-spinner text-4xl" style="color:#1976d2"></i>
    </div>

    <ng-container *ngIf="!loading && ticket">
      <!-- Header -->
      <div class="flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <a routerLink="/tickets" style="color:#666;font-size:.875rem;text-decoration:none">
            ← Torna alla lista
          </a>
          <h2 style="margin:.5rem 0 0">{{ ticket.title }}</h2>
          <div class="flex gap-2 mt-2">
            <span class="border-round px-2 py-1 text-xs font-semibold"
                  [class]="ticket.state_job | stateJobClass">
              {{ ticket.state_job | stateJobLabel }}
            </span>
            <span class="border-round px-2 py-1 text-xs font-semibold"
                  [class]="ticket.priority | priorityClass">
              {{ ticket.priority | priorityLabel }}
            </span>
          </div>
        </div>

        <!-- Azioni supporto -->
        <div class="flex gap-2 flex-wrap" *ngIf="auth.isSupport">
          <button *ngIf="ticket.state_job === 'APERTA' && !ticket.edges?.assigned_to"
                  pButton icon="pi pi-user-plus" label="Prendi in carico"
                  class="p-button-success p-button-sm" (click)="take()"></button>

          <p-dropdown *ngIf="auth.isSupportL1 && ticket.edges?.assigned_to?.id === currentUserId"
                      [options]="l2Users" [(ngModel)]="selL2"
                      optionLabel="username" optionValue="id"
                      placeholder="Scala a L2..." class="p-inputtext-sm"
                      (onChange)="escalate()"></p-dropdown>

          <p-dropdown *ngIf="auth.isSupervisor"
                      [options]="centerUsers" [(ngModel)]="selAssign"
                      optionLabel="username" optionValue="id"
                      placeholder="Riassegna a..." class="p-inputtext-sm"
                      (onChange)="assign()"></p-dropdown>

          <p-dropdown [options]="prioOpts" [(ngModel)]="ticket.priority"
                      optionLabel="label" optionValue="value" class="p-inputtext-sm"
                      (onChange)="setPriority($event.value)"></p-dropdown>

          <p-dropdown [options]="stateOpts" [(ngModel)]="ticket.state_job"
                      optionLabel="label" optionValue="value" class="p-inputtext-sm"
                      (onChange)="setState($event.value)"></p-dropdown>
        </div>
      </div>

      <div class="grid">
        <!-- Colonna sinistra: descrizione + conversazione -->
        <div class="col-12 lg:col-8">
          <p-card header="Descrizione" styleClass="mb-3">
            <p class="line-height-3 m-0 white-space-pre-wrap">{{ ticket.question }}</p>
          </p-card>

          <p-card header="Conversazione">
            <p-timeline [value]="ticket.edges?.comments ?? []" align="left">
              <ng-template pTemplate="marker">
                <span class="flex w-2rem h-2rem align-items-center justify-content-center
                             border-circle z-1" style="background:#1976d2">
                  <i class="pi pi-comment text-white text-xs"></i>
                </span>
              </ng-template>
              <ng-template pTemplate="content" let-c>
                <p-card styleClass="mb-2">
                  <div class="flex gap-2 mb-2 align-items-center">
                    <span class="font-semibold text-sm">
                      {{ c.edges?.author?.username ?? 'Utente' }}
                    </span>
                    <span class="text-500 text-xs">
                      {{ c.data_creation | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                  <p class="m-0 line-height-3 white-space-pre-wrap">{{ c.comment_detail }}</p>
                </p-card>
              </ng-template>
            </p-timeline>

            <p-divider></p-divider>
            <div class="flex flex-column gap-2">
              <label class="font-medium text-sm">Aggiungi commento</label>
              <textarea pInputTextarea [(ngModel)]="newComment" rows="3"
                        placeholder="Scrivi una risposta..." class="w-full"></textarea>
              <div class="flex justify-content-end gap-2">
                <p-fileUpload mode="basic" chooseLabel="Allega file" [auto]="false"
                              (onSelect)="uploadFile($event)"
                              styleClass="p-button-outlined p-button-sm"></p-fileUpload>
                <button pButton label="Invia commento" icon="pi pi-send" class="p-button-sm"
                        [disabled]="!newComment.trim()" [loading]="sending"
                        (click)="addComment()"></button>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Colonna destra: metadati -->
        <div class="col-12 lg:col-4">
          <p-card header="Dettagli" styleClass="mb-3">
            <div class="flex flex-column gap-3">
              <div *ngFor="let f of metaFields">
                <label style="color:#888;font-size:.75rem;font-weight:600;
                              text-transform:uppercase;display:block;margin-bottom:.25rem">
                  {{ f.label }}
                </label>
                <span class="font-medium">{{ f.value || '—' }}</span>
              </div>
              <p-divider styleClass="my-1"></p-divider>
              <div>
                <label style="color:#888;font-size:.75rem;font-weight:600;
                              text-transform:uppercase;display:block;margin-bottom:.25rem">
                  Creato il
                </label>
                <span>{{ ticket.data_creation | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div>
                <label style="color:#888;font-size:.75rem;font-weight:600;
                              text-transform:uppercase;display:block;margin-bottom:.25rem">
                  Aggiornato il
                </label>
                <span>{{ ticket.data_updating | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </p-card>

          <p-card header="Allegati" *ngIf="ticket.edges?.attachments?.length">
            <div *ngFor="let a of ticket.edges?.attachments"
                 class="flex align-items-center gap-2 p-2 mb-1 border-round"
                 style="background:#f5f5f5">
              <i class="pi pi-paperclip text-500"></i>
              <span class="text-sm flex-1" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                {{ a.name }}
              </span>
              <a pButton icon="pi pi-download" class="p-button-text p-button-sm"
                 [href]="a.path" target="_blank" pTooltip="Scarica"></a>
            </div>
          </p-card>
        </div>
      </div>
    </ng-container>
  `
})
export class TicketDetailComponent implements OnInit {
  private route   = inject(ActivatedRoute);
  private svc     = inject(TicketService);
  private userSvc = inject(UserService);
  private msg     = inject(MessageService);
  auth = inject(AuthService);

  loading = true; sending = false;
  ticket: Ticket | null = null;
  newComment = ''; selL2: string | null = null; selAssign: string | null = null;
  l2Users: User[] = []; centerUsers: User[] = [];

  prioOpts = [
    { label: 'Bassa', value: 'LOW' }, { label: 'Media', value: 'MEDIUM' }, { label: 'Alta', value: 'HIGH' }
  ];
  stateOpts = [
    { label: 'Aperta',            value: 'APERTA' },
    { label: 'Presa in carico',   value: 'PRESA_IN_CARICO' },
    { label: 'In attesa cliente', value: 'IN_ATTESA_CLIENTE' },
    { label: 'In attesa CS',      value: 'IN_ATTESA_CENTRO_SERVIZI' },
    { label: 'Chiusa',            value: 'CHIUSA' },
  ];

  get currentUserId(): string { return this.auth.currentProfile?.id ?? ''; }

  get metaFields() {
    if (!this.ticket) return [];
    return [
      { label: 'Azienda',      value: this.ticket.edges?.company?.ragione_sociale },
      { label: 'Centro serv.', value: this.ticket.edges?.service_center?.nome },
      { label: 'Assegnato a',  value: this.ticket.edges?.assigned_to?.username },
      { label: 'Creato da',    value: this.ticket.edges?.created_by?.username },
    ];
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.get(id).subscribe({
      next: t => {
        this.ticket  = t;
        this.loading = false;
        if (this.auth.isSupport) this.loadUsers();
      },
      error: () => { this.loading = false; }
    });
  }

  private loadUsers(): void {
    this.userSvc.listCenterUsers().subscribe(users => {
      this.l2Users     = users.filter(u => u.role === 'support_l2');
      this.centerUsers = users.filter(u => u.role !== 'customer');
    });
  }

  take(): void {
    this.svc.take(this.ticket!.id).subscribe({
      next: t => { this.ticket = t; this.msg.add({ severity: 'success', summary: 'Preso in carico' }); }
    });
  }
  escalate(): void {
    if (!this.selL2) return;
    this.svc.escalate(this.ticket!.id, this.selL2).subscribe({
      next: t => { this.ticket = t; this.selL2 = null; this.msg.add({ severity: 'success', summary: 'Scalato a L2' }); }
    });
  }
  assign(): void {
    if (!this.selAssign) return;
    this.svc.assign(this.ticket!.id, this.selAssign).subscribe({
      next: t => { this.ticket = t; this.selAssign = null; this.msg.add({ severity: 'success', summary: 'Riassegnato' }); }
    });
  }
  setPriority(p: TicketPriority): void {
    this.svc.setPriority(this.ticket!.id, p).subscribe({
      next: t => { this.ticket = t; this.msg.add({ severity: 'success', summary: 'Priorità aggiornata' }); }
    });
  }
  setState(sj: StateJob): void {
    this.svc.setState(this.ticket!.id, sj).subscribe({
      next: t => { this.ticket = t; this.msg.add({ severity: 'success', summary: 'Stato aggiornato' }); }
    });
  }
  addComment(): void {
    if (!this.newComment.trim()) return;
    this.sending = true;
    this.svc.addComment(this.ticket!.id, { detail: this.newComment }).subscribe({
      next: c => {
        if (!this.ticket!.edges) this.ticket!.edges = {};
        if (!this.ticket!.edges.comments) this.ticket!.edges.comments = [];
        this.ticket!.edges.comments.push(c);
        this.newComment = ''; this.sending = false;
        this.msg.add({ severity: 'success', summary: 'Commento aggiunto' });
      },
      error: () => { this.sending = false; }
    });
  }
  uploadFile(event: any): void {
    const file: File = event.files[0];
    if (!file) return;
    this.svc.addAttachment(this.ticket!.id, file).subscribe({
      next: () => this.msg.add({ severity: 'success', summary: 'Allegato caricato' })
    });
  }
}
