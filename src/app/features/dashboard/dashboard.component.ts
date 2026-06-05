import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { TicketService } from '../../core/services/ticket.service';
import { AuthService } from '../../core/services/auth.service';
import { Ticket } from '../../shared/models';
import { StateJobLabelPipe, StateJobClassPipe, PriorityLabelPipe, PriorityClassPipe } from '../../shared/pipes/labels.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink, CardModule, ChartModule,
            TableModule, SkeletonModule, ButtonModule,
            StateJobLabelPipe, StateJobClassPipe, PriorityLabelPipe, PriorityClassPipe],
  template: `
    <div class="page-header">
      <h2>Dashboard</h2>
      <p>Panoramica del sistema ticket</p>
    </div>

    <!-- Stat cards -->
    <div class="grid mb-4">
      <div class="col-12 md:col-6 lg:col-3" *ngFor="let s of stats">
        <p-card styleClass="stat-card">
          <div class="flex align-items-center justify-content-between">
            <div>
              <p class="text-500 text-sm font-medium mb-1 mt-0">{{ s.label }}</p>
              <div class="text-3xl font-bold" [style.color]="s.color">
                {{ loading ? '—' : s.value }}
              </div>
            </div>
            <div class="border-round-xl p-3" [style.background]="s.bg">
              <i [class]="'pi ' + s.icon + ' text-2xl'" [style.color]="s.color"></i>
            </div>
          </div>
        </p-card>
      </div>
    </div>

    <!-- Grafici -->
    <div class="grid mb-4">
      <div class="col-12 md:col-6">
        <p-card header="Ticket per stato">
          <p-chart *ngIf="!loading && stateData" type="doughnut"
                   [data]="stateData" [options]="chartOpts" height="250px"></p-chart>
          <p-skeleton *ngIf="loading" height="250px"></p-skeleton>
        </p-card>
      </div>
      <div class="col-12 md:col-6">
        <p-card header="Ticket per priorità">
          <p-chart *ngIf="!loading && prioData" type="bar"
                   [data]="prioData" [options]="barOpts" height="250px"></p-chart>
          <p-skeleton *ngIf="loading" height="250px"></p-skeleton>
        </p-card>
      </div>
    </div>

    <!-- Ultimi ticket -->
    <p-card header="Ultimi ticket">
      <p-table [value]="recent" [loading]="loading" styleClass="p-datatable-sm" responsiveLayout="scroll">
        <ng-template pTemplate="header">
          <tr>
            <th>Titolo</th><th>Azienda</th><th>Stato</th><th>Priorità</th><th>Data</th><th></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-t>
          <tr>
            <td class="font-medium">{{ t.title }}</td>
            <td>{{ t.edges?.company?.ragione_sociale ?? '—' }}</td>
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
            <td class="text-500 text-sm">{{ t.data_creation | date:'dd/MM/yy HH:mm' }}</td>
            <td>
              <a pButton icon="pi pi-eye" class="p-button-text p-button-sm"
                 [routerLink]="['/tickets', t.id]"></a>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="text-center text-500 py-4">Nessun ticket</td></tr>
        </ng-template>
      </p-table>
    </p-card>
  `
})
export class DashboardComponent implements OnInit {
  private svc = inject(TicketService);
  private auth = inject(AuthService);

  loading = true;
  recent: Ticket[] = [];
  stateData: any = null;
  prioData:  any = null;

  stats = [
    { label: 'Totale ticket',   value: 0, icon: 'pi-ticket',                color: '#1976d2', bg: '#e3f2fd' },
    { label: 'Aperti',          value: 0, icon: 'pi-inbox',                 color: '#2e7d32', bg: '#e8f5e9' },
    { label: 'In lavorazione',  value: 0, icon: 'pi-sync',                  color: '#f57f17', bg: '#fff8e1' },
    { label: 'Alta priorità',   value: 0, icon: 'pi-exclamation-triangle',  color: '#c62828', bg: '#fce4ec' },
  ];

  chartOpts = { plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false };
  barOpts   = { plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } };

  ngOnInit(): void {
    const loader = this.auth.isSupervisor ? this.svc.listCenter()
                 : this.auth.isSupport    ? this.svc.listMine()
                 : this.svc.list();

    loader.subscribe({
      next: tickets => {
        this.stats[0].value = tickets.length;
        this.stats[1].value = tickets.filter(t => t.state_job === 'APERTA').length;
        this.stats[2].value = tickets.filter(t => t.state_job === 'PRESA_IN_CARICO').length;
        this.stats[3].value = tickets.filter(t => t.priority === 'HIGH').length;

        const sc: Record<string, number> = {};
        const pc: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
        tickets.forEach(t => { sc[t.state_job] = (sc[t.state_job] ?? 0) + 1; pc[t.priority]++; });

        this.stateData = {
          labels: ['Aperta', 'Presa in carico', 'Att. cliente', 'Att. CS', 'Chiusa'],
          datasets: [{ data: ['APERTA','PRESA_IN_CARICO','IN_ATTESA_CLIENTE','IN_ATTESA_CENTRO_SERVIZI','CHIUSA'].map(k => sc[k] ?? 0),
                       backgroundColor: ['#1976d2','#2e7d32','#f57f17','#c62828','#9e9e9e'] }]
        };
        this.prioData = {
          labels: ['Bassa', 'Media', 'Alta'],
          datasets: [{ data: [pc['LOW'], pc['MEDIUM'], pc['HIGH']], backgroundColor: ['#2e7d32','#f57f17','#c62828'] }]
        };
        this.recent  = [...tickets].sort((a, b) => new Date(b.data_creation).getTime() - new Date(a.data_creation).getTime()).slice(0, 5);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
