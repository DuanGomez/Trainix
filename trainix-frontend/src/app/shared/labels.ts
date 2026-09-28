/** Etiquetas en español para los valores que devuelve la API. */

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super administrador',
  gym_admin: 'Administrador',
  trainer: 'Entrenador',
  receptionist: 'Recepción',
  member: 'Cliente',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Efectivo', transfer: 'Transferencia', card: 'Tarjeta', other: 'Otro',
};

export const PAYMENT_CONCEPT_LABELS: Record<string, string> = {
  membership: 'Membresía', product: 'Producto', service: 'Servicio / clase', other: 'Otro',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', completed: 'Completado', failed: 'Fallido', refunded: 'Anulado',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado',
};

export const PLAN_DURATIONS: { value: string; label: string; days: number }[] = [
  { value: 'daily', label: 'Diario', days: 1 },
  { value: 'weekly', label: 'Semanal', days: 7 },
  { value: 'biweekly', label: 'Quincenal', days: 15 },
  { value: 'monthly', label: 'Mensual', days: 30 },
  { value: 'quarterly', label: 'Trimestral', days: 90 },
  { value: 'biannual', label: 'Semestral', days: 180 },
  { value: 'annual', label: 'Anual', days: 365 },
];

export const WEEKDAYS: { value: string; label: string }[] = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

export function label(map: Record<string, string>, value: string | null | undefined): string {
  return value ? map[value] ?? value : '';
}

/** Fecha local en formato yyyy-MM-dd (lo que esperan las columnas `date` del backend). */
export function toDateOnly(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Quita los campos vacíos para no mandar '' a validadores como IsEmail o IsEnum. */
export function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined),
  ) as Partial<T>;
}
