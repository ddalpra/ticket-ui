import { Pipe, PipeTransform } from '@angular/core';
import { TicketPriority, StateJob } from '../models';

@Pipe({ name: 'priorityLabel', standalone: true })
export class PriorityLabelPipe implements PipeTransform {
  transform(v: TicketPriority): string {
    return ({ LOW: 'Bassa', MEDIUM: 'Media', HIGH: 'Alta' })[v] ?? v;
  }
}

@Pipe({ name: 'priorityClass', standalone: true })
export class PriorityClassPipe implements PipeTransform {
  transform(v: TicketPriority): string {
    return ({ LOW: 'badge-p-low', MEDIUM: 'badge-p-medium', HIGH: 'badge-p-high' })[v] ?? '';
  }
}

@Pipe({ name: 'stateJobLabel', standalone: true })
export class StateJobLabelPipe implements PipeTransform {
  transform(v: StateJob): string {
    return ({
      APERTA: 'Aperta',
      PRESA_IN_CARICO: 'Presa in carico',
      IN_ATTESA_CLIENTE: 'In attesa cliente',
      IN_ATTESA_CENTRO_SERVIZI: 'In attesa CS',
      CHIUSA: 'Chiusa'
    })[v] ?? v;
  }
}

@Pipe({ name: 'stateJobClass', standalone: true })
export class StateJobClassPipe implements PipeTransform {
  transform(v: StateJob): string {
    return ({
      APERTA: 'badge-j-aperta',
      PRESA_IN_CARICO: 'badge-j-carico',
      IN_ATTESA_CLIENTE: 'badge-j-attcli',
      IN_ATTESA_CENTRO_SERVIZI: 'badge-j-attcs',
      CHIUSA: 'badge-j-chiusa'
    })[v] ?? '';
  }
}

@Pipe({ name: 'roleLabel', standalone: true })
export class RoleLabelPipe implements PipeTransform {
  transform(v: string): string {
    return ({ customer: 'Cliente', support_l1: 'Supporto L1', support_l2: 'Supporto L2', supervisor: 'Supervisore' })[v] ?? v;
  }
}
