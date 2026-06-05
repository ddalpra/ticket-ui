import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Company, CreateCompanyDto, ServiceCenter } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);
  private b    = environment.apiUrl;

  listCompanies()                                                      { return this.http.get<Company[]>(`${this.b}/companies`); }
  createCompany(dto: CreateCompanyDto)                                 { return this.http.post<Company>(`${this.b}/companies`, dto); }
  updateCompany(id: string, dto: Partial<CreateCompanyDto & { active: boolean }>) { return this.http.put<Company>(`${this.b}/companies/${id}`, dto); }
  listServiceCenters()                                                 { return this.http.get<ServiceCenter[]>(`${this.b}/service-centers`); }
  createServiceCenter(codice: string, nome: string)                   { return this.http.post<ServiceCenter>(`${this.b}/service-centers`, { codice, nome }); }
}
