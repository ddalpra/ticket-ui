import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Ticket, CreateTicketDto, AddCommentDto, Comment, TicketPriority, StateJob } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  private b    = `${environment.apiUrl}/tickets`;

  list()           { return this.http.get<Ticket[]>(this.b); }
  get(id: string)  { return this.http.get<Ticket>(`${this.b}/${id}`); }
  create(dto: CreateTicketDto) { return this.http.post<Ticket>(this.b, dto); }
  listMine()       { return this.http.get<Ticket[]>(`${this.b}/mine`); }
  listUnassigned() { return this.http.get<Ticket[]>(`${this.b}/unassigned`); }
  listCenter()     { return this.http.get<Ticket[]>(`${this.b}/center`); }
  take(id: string) { return this.http.put<Ticket>(`${this.b}/${id}/take`, {}); }
  setPriority(id: string, priority: TicketPriority) { return this.http.put<Ticket>(`${this.b}/${id}/priority`, { priority }); }
  setState(id: string, state_job: StateJob)          { return this.http.put<Ticket>(`${this.b}/${id}/state`, { state_job }); }
  escalate(id: string, user_id: string)              { return this.http.put<Ticket>(`${this.b}/${id}/escalate`, { user_id }); }
  assign(id: string, user_id: string)                { return this.http.put<Ticket>(`${this.b}/${id}/assign`, { user_id }); }
  addComment(id: string, dto: AddCommentDto)         { return this.http.post<Comment>(`${this.b}/${id}/comments`, dto); }
  addAttachment(id: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.b}/${id}/attachments`, form);
  }
}
