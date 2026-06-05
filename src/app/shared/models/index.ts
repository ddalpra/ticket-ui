export type TicketState    = 'OPEN' | 'CLOSED' | 'TODO' | 'WAIT';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type StateJob       = 'APERTA' | 'IN_ATTESA_CLIENTE' | 'PRESA_IN_CARICO' | 'IN_ATTESA_CENTRO_SERVIZI' | 'CHIUSA';
export type UserRole       = 'customer' | 'support_l1' | 'support_l2' | 'supervisor';

export interface Company       { id: string; codice: string; ragione_sociale: string; piva: string; cf: string; active: boolean; }
export interface ServiceCenter { id: string; codice: string; nome: string; active: boolean; }
export interface User {
  id: string; keycloak_id: string; username: string; email: string;
  first_name?: string; last_name?: string; role: UserRole; active: boolean;
  edges?: { company?: Company; service_center?: ServiceCenter; };
}
export interface Attachment { id: string; name: string; path: string; mime_type?: string; size_bytes?: number; uploaded_at: string; }
export interface Comment {
  id: string; order_comment: number; comment_detail: string; data_creation: string;
  edges?: { author?: User; attachments?: Attachment[]; };
}
export interface Ticket {
  id: string; title: string; question: string;
  state: TicketState; priority: TicketPriority; state_job: StateJob;
  data_assigned?: string; data_creation: string; data_updating: string;
  edges?: { company?: Company; service_center?: ServiceCenter; assigned_to?: User;
            created_by?: User; comments?: Comment[]; attachments?: Attachment[]; };
}
export interface CreateTicketDto     { title: string; question: string; service_center_id: string; }
export interface AddCommentDto       { detail: string; }
export interface CreateCompanyDto    { codice: string; ragione_sociale: string; piva: string; cf: string; }
export interface RegisterCustomerDto { username: string; email: string; first_name: string; last_name: string; password: string; company_id: string; }
export interface RegisterSupportDto  { username: string; email: string; first_name: string; last_name: string; password: string; role: UserRole; service_center_id: string; }
