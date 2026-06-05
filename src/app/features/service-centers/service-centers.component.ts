import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { CompanyService } from '../../core/services/company.service';
import { ServiceCenter } from '../../shared/models';

@Component({
  selector: 'app-service-centers',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TableModule, ButtonModule,
            DialogModule, InputTextModule, CardModule],
  template: `
    <div class="page-header flex align-items-center justify-content-between">
      <div><h2>Centri servizi</h2><p>{{ centers.length }} centri registrati</p></div>
      <button pButton icon="pi pi-plus" label="Nuovo centro" (click)="showDialog = true"></button>
    </div>

    <p-card>
      <p-table [value]="centers" [loading]="loading" dataKey="id"
               styleClass="p-datatable-sm p-datatable-gridlines">
        <ng-template pTemplate="header">
          <tr>
            <th>Codice</th><th>Nome</th><th>Stato</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-sc>
          <tr>
            <td class="font-medium">{{ sc.codice }}</td>
            <td>{{ sc.nome }}</td>
            <td>
              <span class="border-round px-2 py-1 text-xs font-semibold"
                    [class]="sc.active ? 'badge-active' : 'badge-inactive'">
                {{ sc.active ? 'Attivo' : 'Disabilitato' }}
              </span>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="3" class="text-center text-500 py-5">Nessun centro trovato</td></tr>
        </ng-template>
      </p-table>
    </p-card>

    <p-dialog header="Nuovo centro servizi" [(visible)]="showDialog"
              [modal]="true" [style]="{width:'400px'}" [draggable]="false">
      <div class="flex flex-column gap-3 pt-2">
        <div class="flex flex-column gap-1">
          <label class="font-medium text-sm">Codice *</label>
          <input pInputText [(ngModel)]="form.codice" maxlength="20"/>
        </div>
        <div class="flex flex-column gap-1">
          <label class="font-medium text-sm">Nome *</label>
          <input pInputText [(ngModel)]="form.nome" maxlength="200"/>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Annulla" class="p-button-text" (click)="showDialog = false"></button>
        <button pButton label="Crea" icon="pi pi-check"
                [disabled]="!form.codice || !form.nome"
                [loading]="saving" (click)="create()"></button>
      </ng-template>
    </p-dialog>
  `
})
export class ServiceCentersComponent implements OnInit {
  private svc = inject(CompanyService);
  private msg = inject(MessageService);

  loading = false; saving = false; showDialog = false;
  centers: ServiceCenter[] = [];
  form = { codice: '', nome: '' };

  ngOnInit(): void {
    this.loading = true;
    this.svc.listServiceCenters().subscribe({
      next: sc => { this.centers = sc; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  create(): void {
    this.saving = true;
    this.svc.createServiceCenter(this.form.codice, this.form.nome).subscribe({
      next: sc => {
        this.centers.push(sc);
        this.msg.add({ severity: 'success', summary: 'Centro creato', detail: sc.nome });
        this.showDialog = false;
        this.form = { codice: '', nome: '' };
        this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }
}
