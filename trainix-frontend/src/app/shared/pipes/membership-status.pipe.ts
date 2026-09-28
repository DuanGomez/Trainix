import { Pipe, PipeTransform } from '@angular/core';

const LABELS: Record<string, string> = {
  active:          'Activa',
  expired:         'Vencida',
  frozen:          'Congelada',
  cancelled:       'Cancelada',
  pending_payment: 'Pago pendiente',
};

@Pipe({ name: 'membershipStatus', standalone: true })
export class MembershipStatusPipe implements PipeTransform {
  transform(value: string): string {
    return LABELS[value?.toLowerCase()] ?? value;
  }
}
