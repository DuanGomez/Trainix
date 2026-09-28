/**
 * Datos de ejemplo del modo demo. Se generan relativos a la fecha actual para que
 * el dashboard, los vencimientos y la asistencia siempre se vean "vivos".
 */

export const DEMO_PASSWORD = 'Trainix2024!';

export const DEMO_CREDENTIALS = [
  { label: 'Administrador', email: 'admin@trainix.app', password: DEMO_PASSWORD },
  { label: 'Recepción', email: 'recepcion@trainix.app', password: DEMO_PASSWORD },
  { label: 'Entrenador', email: 'coach@trainix.app', password: DEMO_PASSWORD },
];

export type Row = Record<string, any> & { id: string };

export interface DemoDb {
  version: number;
  gym: Row;
  settings: Row;
  roles: Row[];
  users: Row[];
  plans: Row[];
  members: Row[];
  memberships: Row[];
  payments: Row[];
  attendance: Row[];
  cashSessions: Row[];
  routines: Row[];
}

export const DEMO_DB_VERSION = 2;

export function uuid(): string {
  return crypto.randomUUID();
}

export function dateOnly(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

/** Generador pseudoaleatorio con semilla: la demo se ve igual en cada visita. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const PEOPLE: [string, string, 'M' | 'F'][] = [
  ['Laura', 'Gómez', 'F'], ['Andrés', 'Martínez', 'M'], ['Valentina', 'Ríos', 'F'],
  ['Santiago', 'López', 'M'], ['Camila', 'Herrera', 'F'], ['Mateo', 'Castro', 'M'],
  ['Isabella', 'Moreno', 'F'], ['Sebastián', 'Vargas', 'M'], ['Mariana', 'Torres', 'F'],
  ['Juan', 'Pérez', 'M'], ['Daniela', 'Rojas', 'F'], ['Felipe', 'Díaz', 'M'],
  ['Sofía', 'Ramírez', 'F'], ['Nicolás', 'Jiménez', 'M'], ['Gabriela', 'Cárdenas', 'F'],
  ['Tomás', 'Mejía', 'M'], ['Lucía', 'Ortiz', 'F'], ['Samuel', 'Restrepo', 'M'],
  ['Paula', 'Salazar', 'F'], ['David', 'Muñoz', 'M'], ['Sara', 'Quintero', 'F'],
  ['Alejandro', 'Suárez', 'M'], ['Antonia', 'Rincón', 'F'], ['Emilio', 'Pardo', 'M'],
];

const OBJECTIVES = ['Bajar de peso', 'Ganar masa muscular', 'Mejorar resistencia', 'Tonificar', 'Salud general'];

export function createDemoDb(): DemoDb {
  const rand = rng(42);
  const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const now = new Date();
  const today = dateOnly(now);
  const created = (d: Date) => d.toISOString();

  const gym = {
    id: uuid(), name: 'Trainix Fit Center', slug: 'trainix-fit', nit: '901234567-8',
    phone: '3001234567', email: 'contacto@trainix.app', address: 'Cra 15 # 93-20',
    city: 'Bogotá', country: 'Colombia', isActive: true, subscriptionPlan: 'pro',
  };

  const settings = {
    id: uuid(), gymId: gym.id, currency: 'COP', timezone: 'America/Bogota',
    openingTime: '05:00', closingTime: '22:00', maxCapacity: 80,
    allowCheckinWithoutMembership: false, checkinGraceMinutes: 10,
    daysBeforeExpiryAlert: 5, receiptFooterText: '¡Gracias por entrenar con nosotros!',
  };

  const roleDefs: [string, string][] = [
    ['super_admin', 'Administrador de la plataforma'],
    ['gym_admin', 'Administrador del gimnasio'],
    ['trainer', 'Entrenador'],
    ['receptionist', 'Recepción'],
    ['member', 'Cliente'],
  ];
  const roles = roleDefs.map(([name, description]) => ({
    id: uuid(), name, description, isSystem: true, permissions: [], createdAt: created(now),
  }));
  const role = (name: string) => roles.find((r) => r.name === name)!;

  const users = [
    ['Carlos', 'Mendoza', 'admin@trainix.app', 'gym_admin', '3104567890'],
    ['Paula', 'Andrade', 'recepcion@trainix.app', 'receptionist', '3159876543'],
    ['Diego', 'Fuentes', 'coach@trainix.app', 'trainer', '3201112233'],
    ['Natalia', 'Rueda', 'natalia@trainix.app', 'trainer', '3184445566'],
  ].map(([firstName, lastName, email, roleName, phone]) => ({
    id: uuid(), gymId: gym.id, roleId: role(roleName).id, firstName, lastName, email, phone,
    password: DEMO_PASSWORD, isActive: true, emailVerified: true, createdAt: created(addDays(now, -200)),
  }));
  const admin = users[0];

  const planDefs: [string, string, string, number, number, string, number, boolean, boolean][] = [
    ['Día', 'Acceso por un día a toda la sede.', 'daily', 1, 15000, '#F57C00', 0, false, false],
    ['Mensual', 'Acceso ilimitado durante 30 días.', 'monthly', 30, 95000, '#3D5AFE', 1, false, true],
    ['Trimestral', 'Tres meses con valoración física incluida.', 'quarterly', 90, 255000, '#7B1FA2', 2, false, true],
    ['Anual', 'El mejor precio: 12 meses + acompañante los fines de semana.', 'annual', 365, 890000, '#2E7D32', 4, true, true],
  ];
  const plans = planDefs.map(([name, description, duration, durationDays, price, color, maxFreezes, allowsGuest, includesClasses]) => ({
    id: uuid(), gymId: gym.id, name, description, duration, durationDays, price, color,
    maxFreezes, allowsGuest, includesClasses, isActive: true, createdAt: created(addDays(now, -300)),
  }));
  const [, monthly, quarterly, annual] = plans;

  const members: Row[] = [];
  const memberships: Row[] = [];
  const payments: Row[] = [];
  const attendance: Row[] = [];
  let receipt = 1;
  const nextReceipt = () => `TX-${now.getFullYear()}-${String(receipt++).padStart(5, '0')}`;

  const cashSession = {
    id: uuid(), gymId: gym.id, openedBy: admin.id, status: 'open', openingAmount: 100000,
    openedAt: (() => { const d = new Date(now); d.setHours(6, 0, 0, 0); return d > now ? addDays(d, -1) : d; })().toISOString(),
    closingAmount: null, expectedAmount: null, difference: null, closedAt: null,
  };

  PEOPLE.forEach(([firstName, lastName, gender], i) => {
    // Algunos clientes se inscribieron este mes para que "Nuevos clientes" no quede en cero.
    const joined = i % 6 === 2
      ? addDays(now, -Math.floor(rand() * Math.max(1, now.getDate() - 1)))
      : addDays(now, -Math.floor(35 + rand() * 330));
    const member = {
      id: uuid(), gymId: gym.id, memberCode: `TX-${String(i + 1).padStart(4, '0')}`,
      firstName, lastName, gender, documentType: 'CC',
      documentNumber: String(1010200300 + i * 7919),
      email: `${firstName}.${lastName}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() + '@correo.com',
      phone: `3${String(100000000 + Math.floor(rand() * 899999999))}`,
      birthDate: dateOnly(addDays(now, -365 * (18 + Math.floor(rand() * 30)) - Math.floor(rand() * 365))),
      city: 'Bogotá', objective: pick(OBJECTIVES), healthNotes: i % 7 === 0 ? 'Lesión antigua de rodilla derecha.' : '',
      emergencyContactName: i % 3 === 0 ? 'Familiar' : '', emergencyContactPhone: i % 3 === 0 ? '3000000000' : '',
      isActive: i !== 23, joinedAt: dateOnly(joined), createdAt: created(joined),
    };
    members.push(member);

    // Estado de la membresía: la mayoría activas, algunas por vencer, vencidas y una pendiente de pago.
    const plan = i % 6 === 0 ? quarterly : i % 9 === 0 ? annual : monthly;
    let start: Date;
    let status = 'active';
    if (i === 1 || i === 16) { start = addDays(now, -plan.durationDays - 6); status = 'expired'; }
    else if (i === 20) { start = now; status = 'pending_payment'; }
    else if (i === 23) { start = addDays(now, -plan.durationDays - 40); status = 'cancelled'; }
    else if (i === 3 || i === 8 || i === 12) { start = addDays(now, -plan.durationDays + 2 + (i % 4)); }
    else { start = addDays(now, -Math.floor(rand() * (plan.durationDays - 8))); }

    const membership = {
      id: uuid(), gymId: gym.id, memberId: member.id, planId: plan.id, status,
      startDate: dateOnly(start), endDate: dateOnly(addDays(start, plan.durationDays)),
      pricePaid: plan.price, discountAmount: 0, notes: '', freezesUsed: 0,
      createdBy: admin.id, createdAt: created(start),
    };
    memberships.push(membership);

    // Historial de pagos mensuales desde que se inscribió (máx. 6 meses).
    if (status !== 'pending_payment') {
      const months = Math.min(6, Math.floor((now.getTime() - joined.getTime()) / (30 * 86400000)) + 1);
      for (let m = months - 1; m >= 0; m--) {
        const paidAt = addDays(now, -m * 30 - Math.floor(rand() * 5));
        paidAt.setHours(6 + Math.floor(rand() * 14), Math.floor(rand() * 60));
        if (paidAt > now) paidAt.setTime(now.getTime() - 3600000);
        const method = pick(['cash', 'transfer', 'card', 'transfer']);
        const isToday = dateOnly(paidAt) === today;
        payments.push({
          id: uuid(), gymId: gym.id, memberId: member.id, membershipId: m === 0 ? membership.id : null,
          paymentNumber: '', concept: 'membership', amount: monthly.price, discount: 0, total: monthly.price,
          method, status: 'completed', reference: method === 'transfer' ? `NEQ${Math.floor(rand() * 900000 + 100000)}` : '',
          notes: '', paidAt: paidAt.toISOString(), createdBy: admin.id,
          cashSessionId: method === 'cash' && isToday ? cashSession.id : null, createdAt: paidAt.toISOString(),
        });
      }
    }

    // Asistencia de las últimas dos semanas (los activos vienen 3-5 veces por semana).
    if (status === 'active') {
      for (let d = 13; d >= 0; d--) {
        if (rand() < 0.45) continue;
        const checkin = addDays(now, -d);
        checkin.setHours(5 + Math.floor(rand() * 15), Math.floor(rand() * 60), 0, 0);
        if (checkin > now) continue;
        attendance.push({
          id: uuid(), gymId: gym.id, memberId: member.id, membershipId: membership.id,
          type: 'checkin', recordedAt: checkin.toISOString(), recordedBy: admin.id, notes: '',
        });
        const checkout = new Date(checkin.getTime() + (50 + Math.floor(rand() * 60)) * 60000);
        if (checkout < now) {
          attendance.push({
            id: uuid(), gymId: gym.id, memberId: member.id, membershipId: null,
            type: 'checkout', recordedAt: checkout.toISOString(), recordedBy: admin.id, notes: '',
          });
        }
      }
    }
  });

  // Algunas ventas de productos para que el reporte por concepto tenga variedad.
  ['Proteína whey 2 lb', 'Bebida hidratante', 'Guantes de entrenamiento', 'Clase de spinning'].forEach((item, i) => {
    const paidAt = addDays(now, -i * 3);
    paidAt.setHours(9 + i * 2, 15);
    if (paidAt > now) paidAt.setTime(now.getTime() - 1800000);
    const amount = [120000, 6000, 45000, 20000][i];
    payments.push({
      id: uuid(), gymId: gym.id, memberId: members[i * 5].id, membershipId: null, paymentNumber: '',
      concept: i === 3 ? 'service' : 'product', amount, discount: 0, total: amount,
      method: i % 2 ? 'cash' : 'card', status: 'completed', reference: '', notes: item,
      paidAt: paidAt.toISOString(), createdBy: admin.id,
      cashSessionId: i % 2 && dateOnly(paidAt) === today ? cashSession.id : null, createdAt: paidAt.toISOString(),
    });
  });

  payments.sort((a, b) => a['paidAt'].localeCompare(b['paidAt'])).forEach((p) => (p['paymentNumber'] = nextReceipt()));

  const routines = [
    {
      memberId: members[0].id, trainerId: users[2].id, name: 'Quema de grasa — fase 1', objective: 'Bajar de peso',
      difficulty: 'beginner', durationWeeks: 6,
      days: [['monday', 'Full body + cardio'], ['wednesday', 'Piernas y core'], ['friday', 'HIIT 30 min']],
    },
    {
      memberId: members[1].id, trainerId: users[2].id, name: 'Hipertrofia push/pull/legs', objective: 'Ganar masa muscular',
      difficulty: 'intermediate', durationWeeks: 8,
      days: [['monday', 'Pecho, hombro y tríceps'], ['tuesday', 'Espalda y bíceps'], ['thursday', 'Piernas'], ['saturday', 'Brazos y abdomen']],
    },
    {
      memberId: members[5].id, trainerId: users[3].id, name: 'Resistencia para carrera 10K', objective: 'Mejorar resistencia',
      difficulty: 'advanced', durationWeeks: 10,
      days: [['tuesday', 'Intervalos'], ['thursday', 'Fuerza de tren inferior'], ['sunday', 'Fondo largo']],
    },
  ].map((r) => {
    const id = uuid();
    return {
      ...r, id, gymId: gym.id, isActive: true, notes: '', createdAt: created(addDays(now, -20)),
      days: r.days.map(([day, label], orderIndex) => ({ id: uuid(), routineId: id, day, label, orderIndex, exercises: [] })),
    };
  });

  return {
    version: DEMO_DB_VERSION, gym, settings, roles, users, plans,
    members, memberships, payments, attendance, cashSessions: [cashSession], routines,
  };
}
