import {
  HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse,
} from '@angular/common/http';
import { Observable, delay, dematerialize, materialize, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DEMO_DB_VERSION, DemoDb, Row, addDays, createDemoDb, dateOnly, uuid,
} from './demo-data';

/**
 * Backend simulado para el modo demo (GitHub Pages). Replica las rutas, validaciones,
 * errores y formato de respuesta de la API NestJS de trainix-backend, guardando los
 * datos en localStorage. Solo se registra cuando `environment.demo` es true.
 */

const STORAGE_KEY = 'trainix_demo_db';
const LATENCY_MS = 250;

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

let cache: DemoDb | null = null;

function db(): DemoDb {
  if (cache) return cache;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (stored?.version === DEMO_DB_VERSION) return (cache = stored as DemoDb);
  } catch { /* datos corruptos: se regeneran */ }
  cache = createDemoDb();
  save();
  return cache;
}

function save(): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cache)); } catch { /* modo privado */ }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const nowIso = () => new Date().toISOString();
const fullName = (m: Row) => `${m['firstName']} ${m['lastName']}`;
const byId = (rows: Row[], id: string, what: string) => {
  const row = rows.find((r) => r.id === id);
  if (!row) throw new ApiError(404, `${what} no encontrado`);
  return row;
};

function paginate<T>(rows: T[], params: URLSearchParams) {
  const page = Math.max(1, Number(params.get('page')) || 1);
  const limit = Math.min(100, Math.max(1, Number(params.get('limit')) || 20));
  return {
    data: rows.slice((page - 1) * limit, page * limit),
    total: rows.length,
    page,
    limit,
    totalPages: Math.ceil(rows.length / limit),
  };
}

function matches(search: string | null, ...values: unknown[]): boolean {
  if (!search) return true;
  const q = search.toLowerCase();
  return values.some((v) => String(v ?? '').toLowerCase().includes(q));
}

function required(body: any, ...fields: string[]): void {
  const missing = fields.filter((f) => body?.[f] === undefined || body?.[f] === null || body?.[f] === '');
  if (missing.length) throw new ApiError(400, `Campos requeridos: ${missing.join(', ')}`);
}

function findMember(query: string): Row {
  const q = String(query ?? '').trim();
  const member = db().members.find((m) =>
    m['isActive'] && (m.id === q || m['memberCode'] === q.toUpperCase() || m['documentNumber'] === q));
  if (!member) throw new ApiError(404, 'Cliente no encontrado');
  return member;
}

function currentUser(req: HttpRequest<unknown>): Row {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? '';
  const user = db().users.find((u) => token === `demo.${u.id}` && u['isActive']);
  if (!user) throw new ApiError(401, 'No autenticado');
  return user;
}

const withRole = (u: Row): Row => {
  const { password, ...safe } = u;
  return { ...safe, role: db().roles.find((r) => r.id === u['roleId']) };
};
const withPlan = (m: Row): Row => ({
  ...m,
  plan: db().plans.find((p) => p.id === m['planId']),
  member: db().members.find((x) => x.id === m['memberId']),
});
const withMember = (r: Row): Row => ({ ...r, member: db().members.find((m) => m.id === r['memberId']) });

function sumPayments(from: Date, to: Date): number {
  return db().payments
    .filter((p) => p['status'] === 'completed' && new Date(p['paidAt']) >= from && new Date(p['paidAt']) <= to)
    .reduce((s, p) => s + Number(p['total']), 0);
}

function countCheckins(from: Date, to: Date): number {
  return db().attendance
    .filter((a) => a['type'] === 'checkin' && new Date(a['recordedAt']) >= from && new Date(a['recordedAt']) <= to)
    .length;
}

const startOfDay = (d: Date) => { const r = new Date(d); r.setHours(0, 0, 0, 0); return r; };
const endOfDay = (d: Date) => { const r = new Date(d); r.setHours(23, 59, 59, 999); return r; };
const monthLabel = (d: Date) => d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', '');
const dayLabel = (d: Date) => d.toLocaleDateString('es-CO', { weekday: 'short', day: '2-digit' }).replace('.', '');

function hasOpenCheckinToday(memberId: string): boolean {
  const last = db().attendance
    .filter((a) => a['memberId'] === memberId)
    .sort((a, b) => b['recordedAt'].localeCompare(a['recordedAt']))[0];
  return !!last && last['type'] === 'checkin' && dateOnly(new Date(last['recordedAt'])) === dateOnly(new Date());
}

function checkinResult(member: Row, attendance: Row, membership?: Row) {
  return {
    member: {
      id: member.id, memberCode: member['memberCode'], firstName: member['firstName'],
      lastName: member['lastName'], avatarUrl: member['avatarUrl'],
    },
    membership: membership
      ? { status: membership['status'], endDate: membership['endDate'], plan: { name: withPlan(membership)['plan']?.['name'] } }
      : undefined,
    attendance: { id: attendance.id, type: attendance['type'], recordedAt: attendance['recordedAt'] },
  };
}

function financialReport(params: URLSearchParams) {
  const start = params.get('startDate') ? startOfDay(new Date(`${params.get('startDate')}T00:00:00`)) : new Date(0);
  const end = params.get('endDate') ? endOfDay(new Date(`${params.get('endDate')}T00:00:00`)) : new Date(8.64e15);
  const payments = db().payments
    .filter((p) => p['status'] === 'completed' && new Date(p['paidAt']) >= start && new Date(p['paidAt']) <= end)
    .sort((a, b) => b['paidAt'].localeCompare(a['paidAt']))
    .map(withMember);

  const group = (key: (p: Row) => string) => {
    const map = new Map<string, { total: number; count: number }>();
    payments.forEach((p) => {
      const e = map.get(key(p)) ?? { total: 0, count: 0 };
      e.total += Number(p['total']);
      e.count += 1;
      map.set(key(p), e);
    });
    return [...map.entries()].map(([k, v]) => ({ key: k, ...v })).sort((a, b) => b.total - a.total);
  };

  return {
    totalRevenue: payments.reduce((s, p) => s + Number(p['total']), 0),
    totalPayments: payments.length,
    byMethod: group((p) => p['method']).map(({ key, ...v }) => ({ method: key, ...v })),
    byConcept: group((p) => p['concept']).map(({ key, ...v }) => ({ concept: key, ...v })),
    dailyTrend: group((p) => dateOnly(new Date(p['paidAt'])))
      .map(({ key, total }) => ({ date: key, total }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    payments,
  };
}

function financialCsv(params: URLSearchParams): Blob {
  const { payments, totalRevenue } = financialReport(params);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['Nº Recibo', 'Fecha', 'Cliente', 'Concepto', 'Método', 'Monto', 'Descuento', 'Total'],
    ...payments.map((p: any) => [
      p.paymentNumber, new Date(p.paidAt).toLocaleString('es-CO'), p.member ? fullName(p.member) : '',
      p.concept, p.method, p.amount, p.discount, p.total,
    ]),
    [],
    ['', '', '', 'TOTAL', '', '', '', totalRevenue],
  ];
  return new Blob(['﻿' + rows.map((r) => r.map(esc).join(';')).join('\n')], { type: 'text/csv;charset=utf-8' });
}

// ─── Rutas ──────────────────────────────────────────────────────────────────

type Handler = (ctx: { req: HttpRequest<any>; body: any; params: URLSearchParams; id: string; user: () => Row }) => unknown;

const routes: [string, RegExp, Handler][] = [];
const route = (method: string, pattern: string, handler: Handler) =>
  routes.push([method, new RegExp(`^${pattern.replace(/:id/g, '([^/]+)')}$`), handler]);

// Auth
route('POST', 'auth/login', ({ body }) => {
  const user = db().users.find((u) => u['email'] === String(body?.email ?? '').trim().toLowerCase());
  if (!user || !user['isActive'] || user['password'] !== body?.password) throw new ApiError(401, 'Credenciales incorrectas');
  user['lastLoginAt'] = nowIso();
  save();
  return { user: withRole(user), accessToken: `demo.${user.id}`, refreshToken: `demo.${user.id}` };
});
route('POST', 'auth/refresh', ({ body }) => {
  const user = db().users.find((u) => body?.refreshToken === `demo.${u.id}`);
  if (!user) throw new ApiError(401, 'Refresh token inválido o expirado');
  return { accessToken: `demo.${user.id}`, refreshToken: `demo.${user.id}` };
});
route('POST', 'auth/logout', () => ({ message: 'Sesión cerrada exitosamente' }));
route('GET', 'auth/me', ({ user }) => ({ ...withRole(user()), gym: db().gym }));
route('POST', 'auth/forgot-password', () => ({ message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña' }));
route('POST', 'auth/change-password', ({ body, user }) => {
  const u = user();
  if (u['password'] !== body?.currentPassword) throw new ApiError(400, 'La contraseña actual es incorrecta');
  if (String(body?.newPassword ?? '').length < 8) throw new ApiError(400, 'La nueva contraseña debe tener al menos 8 caracteres');
  u['password'] = body.newPassword;
  save();
  return { message: 'Contraseña actualizada exitosamente' };
});

// Dashboard
route('GET', 'dashboard/summary', () => {
  const now = new Date();
  const { members, memberships, cashSessions } = db();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const in7 = dateOnly(addDays(now, 7));
  return {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m['isActive']).length,
    todayAttendance: countCheckins(startOfDay(now), endOfDay(now)),
    todayRevenue: sumPayments(startOfDay(now), endOfDay(now)),
    expiringMemberships: memberships.filter((m) => m['status'] === 'active' && m['endDate'] >= dateOnly(now) && m['endDate'] <= in7).length,
    monthRevenue: sumPayments(monthStart, endOfDay(now)),
    newMembersMonth: members.filter((m) => m['joinedAt'] >= dateOnly(monthStart)).length,
    openCashSession: cashSessions.some((s) => s['status'] === 'open'),
  };
});
route('GET', 'dashboard/revenue-chart', () => Array.from({ length: 6 }, (_, i) => {
  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
  return { label: monthLabel(month), value: sumPayments(month, end) };
}));
route('GET', 'dashboard/attendance-chart', () => Array.from({ length: 7 }, (_, i) => {
  const day = addDays(new Date(), i - 6);
  return { label: dayLabel(day), value: countCheckins(startOfDay(day), endOfDay(day)) };
}));

// Members
route('GET', 'members', ({ params }) => paginate(
  db().members
    .filter((m) => matches(params.get('search'), m['firstName'], m['lastName'], fullName(m), m['documentNumber'], m['memberCode']))
    .sort((a, b) => a['firstName'].localeCompare(b['firstName'])),
  params,
));
route('GET', 'members/:id', ({ id }) => byId(db().members, id, 'Cliente'));
route('POST', 'members', ({ body }) => {
  required(body, 'firstName', 'lastName', 'documentType', 'documentNumber', 'birthDate');
  const { members } = db();
  if (members.some((m) => m['documentNumber'] === body.documentNumber)) {
    throw new ApiError(409, 'Ya existe un cliente con ese número de documento');
  }
  const next = Math.max(0, ...members.map((m) => Number(m['memberCode'].slice(3)))) + 1;
  const member = {
    ...body, id: uuid(), gymId: db().gym.id, memberCode: `TX-${String(next).padStart(4, '0')}`,
    firstName: body.firstName.trim(), lastName: body.lastName.trim(),
    isActive: true, joinedAt: dateOnly(new Date()), createdAt: nowIso(),
  };
  members.push(member);
  save();
  return member;
});
route('PUT', 'members/:id', ({ id, body }) => {
  const member = byId(db().members, id, 'Cliente');
  const clash = db().members.find((m) => m.id !== id && body.documentNumber && m['documentNumber'] === body.documentNumber);
  if (clash) throw new ApiError(409, 'Ya existe un cliente con ese número de documento');
  Object.assign(member, body, { updatedAt: nowIso() });
  save();
  return member;
});
route('DELETE', 'members/:id', ({ id }) => {
  byId(db().members, id, 'Cliente')['isActive'] = false;
  save();
  return { message: 'Cliente desactivado' };
});
route('POST', 'members/:id/activate', ({ id }) => {
  byId(db().members, id, 'Cliente')['isActive'] = true;
  save();
  return { message: 'Cliente activado' };
});

// Plans
route('GET', 'plans', () => db().plans.filter((p) => p['isActive']).sort((a, b) => a['price'] - b['price']));
route('GET', 'plans/:id', ({ id }) => byId(db().plans, id, 'Plan'));
route('POST', 'plans', ({ body }) => {
  required(body, 'name', 'duration', 'durationDays', 'price');
  const plan = { ...body, id: uuid(), gymId: db().gym.id, isActive: true, createdAt: nowIso() };
  db().plans.push(plan);
  save();
  return plan;
});
route('PUT', 'plans/:id', ({ id, body }) => {
  const plan = Object.assign(byId(db().plans, id, 'Plan'), body);
  save();
  return plan;
});
route('DELETE', 'plans/:id', ({ id }) => {
  byId(db().plans, id, 'Plan')['isActive'] = false;
  save();
  return { message: 'Plan desactivado' };
});

// Memberships
route('GET', 'memberships', ({ params }) => paginate(
  db().memberships.map(withPlan)
    .filter((m) => !params.get('status') || m['status'] === params.get('status'))
    .filter((m) => matches(params.get('search'), m['member']?.['firstName'], m['member']?.['lastName'], m['member']?.['memberCode'], m['plan']?.['name']))
    .sort((a, b) => a['endDate'].localeCompare(b['endDate'])),
  params,
));
route('GET', 'memberships/expiring', ({ params }) => {
  const today = dateOnly(new Date());
  const limit = dateOnly(addDays(new Date(), Number(params.get('days')) || 7));
  return db().memberships
    .filter((m) => m['status'] === 'active' && m['endDate'] >= today && m['endDate'] <= limit)
    .map(withPlan);
});
route('POST', 'memberships', ({ body, user }) => {
  required(body, 'memberId', 'planId', 'startDate', 'pricePaid');
  const member = findMember(body.memberId);
  if (db().memberships.some((m) => m['memberId'] === member.id && m['status'] === 'active')) {
    throw new ApiError(409, 'El cliente ya tiene una membresía activa');
  }
  const plan = db().plans.find((p) => p.id === body.planId);
  if (!plan) throw new ApiError(404, 'Plan no encontrado');
  const start = new Date(body.startDate);
  const membership = {
    id: uuid(), gymId: db().gym.id, memberId: member.id, planId: plan.id,
    status: 'pending_payment', startDate: dateOnly(start), endDate: dateOnly(addDays(start, plan['durationDays'])),
    pricePaid: Number(body.pricePaid), discountAmount: Number(body.discountAmount) || 0, notes: body.notes ?? '',
    freezesUsed: 0, createdBy: user().id, createdAt: nowIso(),
  };
  db().memberships.push(membership);
  save();
  return membership;
});

// Payments
route('GET', 'payments', ({ params }) => paginate(
  db().payments.map(withMember)
    .filter((p) => matches(params.get('search'), p['paymentNumber'], p['member']?.['firstName'], p['member']?.['lastName'], p['member']?.['memberCode']))
    .sort((a, b) => b['createdAt'].localeCompare(a['createdAt'])),
  params,
));
route('GET', 'payments/today-total', () => {
  const start = startOfDay(new Date());
  const map = new Map<string, number>();
  db().payments
    .filter((p) => p['status'] === 'completed' && new Date(p['paidAt']) >= start)
    .forEach((p) => map.set(p['method'], (map.get(p['method']) ?? 0) + Number(p['total'])));
  const breakdown = [...map.entries()].map(([method, total]) => ({ method, total }));
  return { total: breakdown.reduce((s, r) => s + r.total, 0), breakdown };
});
route('POST', 'payments', ({ body, user }) => {
  required(body, 'memberId', 'concept', 'amount', 'method');
  const member = findMember(body.memberId);
  const amount = Number(body.amount);
  const discount = Number(body.discount) || 0;
  const total = amount - discount;
  if (total <= 0) throw new ApiError(400, 'El total no puede ser cero o negativo');

  let cashSessionId: string | null = null;
  if (body.method === 'cash') {
    const session = db().cashSessions.find((s) => s['status'] === 'open');
    if (!session) throw new ApiError(400, 'No hay una sesión de caja abierta');
    cashSessionId = session.id;
  }

  let membershipId = body.membershipId ?? null;
  if (!membershipId && body.concept === 'membership') {
    membershipId = db().memberships
      .filter((m) => m['memberId'] === member.id && m['status'] === 'pending_payment')
      .sort((a, b) => b['createdAt'].localeCompare(a['createdAt']))[0]?.id ?? null;
  }
  if (membershipId) {
    const m = db().memberships.find((x) => x.id === membershipId);
    if (m) m['status'] = 'active';
  }

  const year = new Date().getFullYear();
  const payment = {
    id: uuid(), gymId: db().gym.id, memberId: member.id, membershipId,
    paymentNumber: `TX-${year}-${String(db().payments.length + 1).padStart(5, '0')}`,
    concept: body.concept, amount, discount, total, method: body.method, status: 'completed',
    reference: body.reference ?? '', notes: body.notes ?? '', paidAt: nowIso(), createdBy: user().id,
    cashSessionId, createdAt: nowIso(),
  };
  db().payments.push(payment);
  save();
  return payment;
});

// Attendance
route('GET', 'attendance', ({ params }) => paginate(
  db().attendance.map(withMember)
    .filter((a) => matches(params.get('search'), a['member']?.['firstName'], a['member']?.['lastName'], a['member']?.['memberCode']))
    .sort((a, b) => b['recordedAt'].localeCompare(a['recordedAt'])),
  params,
));
route('POST', 'attendance/checkin', ({ body, user }) => {
  required(body, 'query');
  const member = findMember(body.query);
  const membership = db().memberships.find((m) => m['memberId'] === member.id && m['status'] === 'active');
  if (!membership) throw new ApiError(400, `${fullName(member)} no tiene una membresía activa`);
  if (hasOpenCheckinToday(member.id)) throw new ApiError(409, `${fullName(member)} ya tiene un check-in activo hoy`);
  const attendance = {
    id: uuid(), gymId: db().gym.id, memberId: member.id, membershipId: membership.id,
    type: 'checkin', recordedAt: nowIso(), recordedBy: user().id, notes: body.notes ?? '',
  };
  db().attendance.push(attendance);
  save();
  return checkinResult(member, attendance, membership);
});
route('POST', 'attendance/checkout', ({ body, user }) => {
  required(body, 'query');
  const member = findMember(body.query);
  if (!hasOpenCheckinToday(member.id)) throw new ApiError(400, `${fullName(member)} no tiene un check-in abierto hoy`);
  const attendance = {
    id: uuid(), gymId: db().gym.id, memberId: member.id, membershipId: null,
    type: 'checkout', recordedAt: nowIso(), recordedBy: user().id, notes: body.notes ?? '',
  };
  db().attendance.push(attendance);
  save();
  return checkinResult(member, attendance);
});

// Cash register
const withOpener = (s: Row): Row => ({ ...s, openedByUser: withRole(db().users.find((u) => u.id === s['openedBy'])!) });
route('GET', 'cash-sessions/current', () => {
  const s = db().cashSessions.find((x) => x['status'] === 'open');
  return s ? withOpener(s) : null;
});
route('POST', 'cash-sessions/open', ({ body, user }) => {
  if (db().cashSessions.some((s) => s['status'] === 'open')) throw new ApiError(409, 'Ya existe una sesión de caja abierta');
  const session = {
    id: uuid(), gymId: db().gym.id, openedBy: user().id, status: 'open',
    openingAmount: Number(body?.openingAmount) || 0, openedAt: nowIso(),
    closingAmount: null, expectedAmount: null, difference: null, closedAt: null,
  };
  db().cashSessions.push(session);
  save();
  return session;
});
route('POST', 'cash-sessions/:id/close', ({ id, body, user }) => {
  const session = byId(db().cashSessions, id, 'Sesión de caja');
  if (session['status'] === 'closed') throw new ApiError(400, 'La sesión ya está cerrada');
  if (body?.closingAmount === undefined || Number(body.closingAmount) < 0) throw new ApiError(400, 'Monto de cierre inválido');
  const cash = db().payments
    .filter((p) => p['cashSessionId'] === id && p['status'] === 'completed' && p['method'] === 'cash')
    .reduce((s, p) => s + Number(p['total']), 0);
  const expectedAmount = Number(session['openingAmount']) + cash;
  Object.assign(session, {
    status: 'closed', closedBy: user().id, closingAmount: Number(body.closingAmount),
    expectedAmount, difference: Number(body.closingAmount) - expectedAmount, closedAt: nowIso(),
  });
  save();
  return withOpener(session);
});

// Reports
route('GET', 'reports/financial', ({ params }) => financialReport(params));
route('GET', 'reports/financial/excel', ({ params }) => financialCsv(params));

// Routines
const withRoutineMember = (r: Row): Row => ({
  ...r,
  member: db().members.find((m) => m.id === r['memberId']),
  trainer: db().users.find((u) => u.id === r['trainerId']),
});
route('GET', 'routines', ({ params }) => paginate(
  db().routines.filter((r) => r['isActive']).map(withRoutineMember)
    .filter((r) => matches(params.get('search'), r['name'], r['member']?.['firstName'], r['member']?.['lastName'], r['member']?.['memberCode']))
    .sort((a, b) => b['createdAt'].localeCompare(a['createdAt'])),
  params,
));
route('GET', 'routines/:id', ({ id }) => withRoutineMember(byId(db().routines, id, 'Rutina')));
const routineDays = (routineId: string, days: any[] = []) =>
  days.map((d, i) => ({ id: uuid(), routineId, day: d.day, label: d.label ?? '', orderIndex: d.orderIndex ?? i, exercises: [] }));
route('POST', 'routines', ({ body }) => {
  required(body, 'memberId', 'name');
  const member = findMember(body.memberId);
  const id = uuid();
  const routine = {
    ...body, id, gymId: db().gym.id, memberId: member.id, isActive: true,
    days: routineDays(id, body.days), createdAt: nowIso(),
  };
  db().routines.push(routine);
  save();
  return withRoutineMember(routine);
});
route('PUT', 'routines/:id', ({ id, body }) => {
  const routine = byId(db().routines, id, 'Rutina');
  const { days, memberId, ...fields } = body ?? {};
  Object.assign(routine, fields);
  if (memberId) routine['memberId'] = findMember(memberId).id;
  if (days) routine['days'] = routineDays(id, days);
  save();
  return withRoutineMember(routine);
});
route('DELETE', 'routines/:id', ({ id }) => {
  byId(db().routines, id, 'Rutina');
  db().routines = db().routines.filter((r) => r.id !== id);
  save();
  return { message: 'Rutina eliminada' };
});

// Settings
route('GET', 'settings', () => db().settings);
route('PUT', 'settings', ({ body }) => {
  Object.assign(db().settings, body);
  save();
  return db().settings;
});

// Users & roles
route('GET', 'users', ({ params }) => paginate(
  db().users.map(withRole)
    .filter((u) => matches(params.get('search'), u['firstName'], u['lastName'], u['email']))
    .sort((a, b) => b['createdAt'].localeCompare(a['createdAt'])),
  params,
));
route('GET', 'users/:id', ({ id }) => withRole(byId(db().users, id, 'Usuario')));
route('POST', 'users', ({ body }) => {
  required(body, 'firstName', 'lastName', 'email', 'password', 'roleId');
  const email = String(body.email).trim().toLowerCase();
  if (db().users.some((u) => u['email'] === email)) throw new ApiError(409, 'El email ya está registrado en este gimnasio');
  if (String(body.password).length < 8) throw new ApiError(400, 'La contraseña debe tener al menos 8 caracteres');
  const user = { ...body, email, id: uuid(), gymId: db().gym.id, isActive: true, emailVerified: false, createdAt: nowIso() };
  db().users.push(user);
  save();
  return withRole(user);
});
route('PUT', 'users/:id', ({ id, body }) => {
  const user = byId(db().users, id, 'Usuario');
  const { password, ...fields } = body ?? {};
  Object.assign(user, fields);
  save();
  return withRole(user);
});
route('DELETE', 'users/:id', ({ id, user }) => {
  if (user().id === id) throw new ApiError(400, 'No puedes desactivar tu propio usuario');
  byId(db().users, id, 'Usuario')['isActive'] = false;
  save();
  return { message: 'Usuario desactivado' };
});
route('GET', 'roles', () => db().roles);

// ─── Interceptor ────────────────────────────────────────────────────────────

export const demoBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const prefix = `${environment.apiUrl}/`;
  if (!req.url.startsWith(prefix)) return next(req);

  const [path, query = ''] = req.url.slice(prefix.length).split('?');
  const params = new URLSearchParams(query);
  req.params.keys().forEach((k) => params.set(k, req.params.get(k)!));

  const respond = (): Observable<any> => {
    for (const [method, pattern, handler] of routes) {
      const match = method === req.method && path.match(pattern);
      if (!match) continue;
      const data = handler({
        req, body: req.body, params, id: match[1] ?? '', user: () => currentUser(req),
      });
      const body = data instanceof Blob ? data : { success: true, data, timestamp: nowIso() };
      return of(new HttpResponse({ status: 200, body, url: req.url }));
    }
    throw new ApiError(404, `Cannot ${req.method} /api/v1/${path}`);
  };

  let result: Observable<any>;
  try {
    // Todas las rutas salvo login/refresh/forgot requieren sesión, como en la API real.
    if (!/^auth\/(login|refresh|forgot-password)$/.test(path)) currentUser(req);
    result = respond();
  } catch (e) {
    const err = e instanceof ApiError ? e : new ApiError(500, 'Error interno del servidor');
    if (!(e instanceof ApiError)) console.error(e);
    result = throwError(() => new HttpErrorResponse({
      status: err.status,
      url: req.url,
      error: {
        success: false,
        error: { statusCode: err.status, message: err.message, path: `/api/v1/${path}`, timestamp: nowIso() },
      },
    }));
  }

  // materialize/dematerialize para que el retraso aplique también a los errores.
  return result.pipe(materialize(), delay(LATENCY_MS), dematerialize());
};
