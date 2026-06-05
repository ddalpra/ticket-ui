import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, RegisterCustomerDto, RegisterSupportDto } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private b    = `${environment.apiUrl}/admin`;

  listCenterUsers()                          { return this.http.get<User[]>(`${this.b}/users`); }
  registerCustomer(dto: RegisterCustomerDto) { return this.http.post<User>(`${this.b}/users/customer`, dto); }
  registerSupport(dto: RegisterSupportDto)   { return this.http.post<User>(`${this.b}/users/support`, dto); }
  setActive(id: string, active: boolean)     { return this.http.put<User>(`${this.b}/users/${id}/active`, { active }); }
}
