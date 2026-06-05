import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { CompanyService } from '../../core/services/company.service';
import { Company, CreateCompanyDto } from '../../shared/models';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, TableModule, ButtonModule,
            DialogModule, InputTextModule, CardModule, TooltipModule],
  template: `
    <div class="page-header flex align-items-center justify-content-between">
      <div><h2>Aziende clienti</h2><p>{{ companies.length }} aziende registrate</p></div>
      <button pButton icon="pi pi-plus" label="Nuova azienda" (click)="openCreate()"></button>
    </div>

    <p-card>
      <p-table [value]="companies" [loading]="loading" [rows]="15" [paginator]="true"
               dataKey="id" styleClass="p-datatable-sm p-datatable-gridlines" responsiveLayout="scroll">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="codice">Codice <p-sortIcon field="codice"></p-sortIcon></th>
            <th pSortableColumn="ragione_sociale">Ragione sociale <p-sortIcon field="ragione_sociale"></p-sortIcon></th>
            <th>P.IVA</th><th>C.F.</th><th>Stato</th>
            <th style="width:90px">Azioni</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-c>
          <tr>
            <td class="font-medium">{{ c.codice }}</td>
            <td class="font-medium">{{ c.ragione_sociale }}</td>
            <td>{{ c.piva }}</td>
            <td>{{ c.cf }}</td>
            <td>
              <span class="border-round px-2 py-1 text-xs font-semibold"
                    [class]="c.active ? 'badge-active' : 'badge-inactive'">
                {{ c.active ? 'Attiva' : 'Disabilitata' }}
              </span>
            </td>
            <td>
              <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm"
                      pTooltip="Modifica" (click)="openEdit(c)"></button>
              <button pButton [icon]="c.active ? 'pi pi-ban' : 'pi pi-check'"
                      class="p-button-text p-button-sm"
                      [pTooltip]="c.active ? 'Disabilita' : 'Abilita'"
                      (click)="toggleActive(c)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="6" class="text-center text-500 py-5">Nessuna azienda trovata</td></tr>
        </ng-template>
      </p-table>
    </p-card>

    <p-dialog [header]="editing ? 'Modifica azienda' : 'Nuova azienda'"
              [(visible)]="showDialog" [modal]="true"
              [style]="{width:'480px'}" [draggable]="false">
      <div class="flex flex-column gap-3 pt-2">
        <div class="flex flex-column gap-1">
          <label class="font-medium text-sm">Codice *</label>
          <input pInputText [(ngModel)]="form.codice" maxlength="15" [disabled]="!!editing"/>
        </div>
        <div class="flex flex-column gap-1">
          <label class="font-medium text-sm">Ragione sociale *</label>
          <input pInputText [(ngModel)]="form.ragione_sociale" maxlength="200"/>
        </div>
        <div class="grid">
          <div class="col-6 flex flex-column gap-1">
            <label class="font-medium text-sm">P.IVA *</label>
            <input pInputText [(ngModel)]="form.piva" maxlength="16"/>
          </div>
          <div class="col-6 flex flex-column gap-1">
            <label class="font-medium text-sm">C.F. *</label>
            <input pInputText [(ngModel)]="form.cf" maxlength="16"/>
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Annulla" class="p-button-text" (click)="showDialog = false"></button>
        <button pButton [label]="editing ? 'Salva' : 'Crea'" icon="pi pi-check"
                [disabled]="!form.codice || !form.ragione_sociale"
                [loading]="saving" (click)="save()"></button>
      </ng-template>
    </p-dialog>
  `
})
export class CompaniesComponent implements OnInit {
  private svc = inject(CompanyService);
  private msg = inject(MessageService);

  loading = false; saving = false; showDialog = false;
  companies: Company[] = [];
  editing: Company | null = null;
  form: CreateCompanyDto = { codice: '', ragione_sociale: '', piva: '', cf: '' };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.listCompanies().subscribe({
      next: c => { this.companies = c; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openCreate(): void {
    this.editing = null;
    this.form = { codice: '', ragione_sociale: '', piva: '', cf: '' };
    this.showDialog = true;
  }

  openEdit(c: Company): void {
    this.editing = c;
    this.form = { codice: c.codice, ragione_sociale: c.ragione_sociale, piva: c.piva, cf: c.cf };
    this.showDialog = true;
  }

  save(): void {
    this.saving = true;
    const obs = this.editing
      ? this.svc.updateCompany(this.editing.id, this.form)
      : this.svc.createCompany(this.form);
    obs.subscribe({
      next: c => {
        if (this.editing) {
          const i = this.companies.findIndex(x => x.id === c.id);
          if (i >= 0) this.companies[i] = c;
        } else {
          this.companies.push(c);
        }
        this.msg.add({ severity: 'success', summary: this.editing ? 'Azienda aggiornata' : 'Azienda creata', detail: c.ragione_sociale });
        this.showDialog = false; this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }

  toggleActive(c: Company): void {
    this.svc.updateCompany(c.id, { active: !c.active }).subscribe({
      next: upd => {
        const i = this.companies.findIndex(x => x.id === c.id);
        if (i >= 0) this.companies[i] = upd;
      }
    });
  }
}
