import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

/**
 * El NativeDateAdapter muestra las fechas en es-CO (dd/mm/aaaa) pero las interpreta con
 * Date.parse (formato de EE. UU.), así que "15/03/1995" escrito a mano quedaba vacío.
 * Este adaptador interpreta día/mes/año con "/", "-" o ".".
 */
@Injectable()
export class CoDateAdapter extends NativeDateAdapter {
  override parse(value: unknown, parseFormat?: unknown): Date | null {
    if (typeof value === 'string') {
      const m = value.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
      if (m) {
        const day = +m[1];
        const month = +m[2] - 1;
        let year = +m[3];
        if (m[3].length === 2) year += year > 50 ? 1900 : 2000;
        const d = new Date(year, month, day);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day ? d : this.invalid();
      }
    }
    return super.parse(value, parseFormat);
  }
}
