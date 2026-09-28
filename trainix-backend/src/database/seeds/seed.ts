/**
 * Seed de datos de ejemplo: roles, un gimnasio, usuarios, planes, clientes,
 * membresías, pagos y asistencias. Ejecutar con `npm run seed`.
 * Es idempotente: si el gimnasio demo ya existe, no hace nada.
 */
import 'reflect-metadata';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { DataSource } from 'typeorm';
import { addDays, format, subDays, subMonths } from 'date-fns';
import { hashPassword } from '../../common/utils/bcrypt.util';
import { Role as RoleName } from '../../common/enums/role.enum';
import { MembershipStatus } from '../../common/enums/membership-status.enum';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { AttendanceType } from '../../common/enums/attendance-type.enum';
import { Role } from '../../modules/roles/entities/role.entity';
import { Gym } from '../../modules/gyms/entities/gym.entity';
import { GymSettings } from '../../modules/settings/entities/gym-settings.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Plan, PlanDuration } from '../../modules/plans/entities/plan.entity';
import { Member, Gender } from '../../modules/members/entities/member.entity';
import { Membership } from '../../modules/memberships/entities/membership.entity';
import { Payment, PaymentConcept } from '../../modules/payments/entities/payment.entity';
import { Attendance } from '../../modules/attendance/entities/attendance.entity';

const DB_PATH = process.env.DB_PATH || 'data/trainix.sqlite';
const DEMO_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Trainix2024!';

const MEMBERS: [string, string, Gender][] = [
  ['Laura', 'Gómez', Gender.F], ['Andrés', 'Martínez', Gender.M], ['Valentina', 'Ríos', Gender.F],
  ['Santiago', 'López', Gender.M], ['Camila', 'Herrera', Gender.F], ['Mateo', 'Castro', Gender.M],
  ['Isabella', 'Moreno', Gender.F], ['Sebastián', 'Vargas', Gender.M], ['Mariana', 'Torres', Gender.F],
  ['Juan', 'Pérez', Gender.M], ['Daniela', 'Rojas', Gender.F], ['Felipe', 'Díaz', Gender.M],
];

async function run() {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const ds = new DataSource({
    type: 'better-sqlite3',
    database: DB_PATH,
    entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
    synchronize: true,
  });
  await ds.initialize();

  if (await ds.getRepository(Gym).findOneBy({ slug: 'trainix-fit' })) {
    console.log('ℹ️  El seed ya fue aplicado. Borra la base de datos para regenerarlo.');
    await ds.destroy();
    return;
  }

  const roles = new Map<string, Role>();
  for (const [name, description] of [
    [RoleName.SUPER_ADMIN, 'Administrador de la plataforma'],
    [RoleName.GYM_ADMIN, 'Administrador del gimnasio'],
    [RoleName.TRAINER, 'Entrenador'],
    [RoleName.RECEPTIONIST, 'Recepción'],
    [RoleName.MEMBER, 'Cliente'],
  ]) {
    roles.set(name, await ds.getRepository(Role).save({ name, description, isSystem: true, permissions: [] }));
  }

  const gym = await ds.getRepository(Gym).save({
    name: 'Trainix Fit Center', slug: 'trainix-fit', nit: '901234567-8',
    phone: '3001234567', email: 'contacto@trainix.app', address: 'Cra 15 # 93-20',
    city: 'Bogotá', subscriptionPlan: 'pro',
  });
  await ds.getRepository(GymSettings).save({ gymId: gym.id, maxCapacity: 80, receiptFooterText: '¡Gracias por entrenar con nosotros!' });

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const users = ds.getRepository(User);
  const admin = await users.save({
    gymId: gym.id, roleId: roles.get(RoleName.GYM_ADMIN)!.id, firstName: 'Carlos', lastName: 'Admin',
    email: process.env.SUPER_ADMIN_EMAIL || 'admin@trainix.app', passwordHash, emailVerified: true,
  });
  await users.save([
    { gymId: gym.id, roleId: roles.get(RoleName.RECEPTIONIST)!.id, firstName: 'Paula', lastName: 'Recepción', email: 'recepcion@trainix.app', passwordHash },
    { gymId: gym.id, roleId: roles.get(RoleName.TRAINER)!.id, firstName: 'Diego', lastName: 'Entrenador', email: 'coach@trainix.app', passwordHash },
  ]);

  const planRepo = ds.getRepository(Plan);
  const plans = await planRepo.save(planRepo.create([
    { gymId: gym.id, name: 'Mensual', duration: PlanDuration.MONTHLY, durationDays: 30, price: 90000, color: '#1976D2', maxFreezes: 1 },
    { gymId: gym.id, name: 'Trimestral', duration: PlanDuration.QUARTERLY, durationDays: 90, price: 240000, color: '#7B1FA2', maxFreezes: 2 },
    { gymId: gym.id, name: 'Anual', duration: PlanDuration.ANNUAL, durationDays: 365, price: 850000, color: '#2E7D32', maxFreezes: 4, allowsGuest: true },
    { gymId: gym.id, name: 'Día', duration: PlanDuration.DAILY, durationDays: 1, price: 15000, color: '#F57C00', includesClasses: false },
  ]));

  const today = new Date();
  let paymentSeq = 1;
  for (const [i, [firstName, lastName, gender]] of MEMBERS.entries()) {
    const joined = subMonths(today, (i % 6) + 1);
    const member = await ds.getRepository(Member).save({
      gymId: gym.id, memberCode: `TX-${String(i + 1).padStart(4, '0')}`, firstName, lastName, gender,
      documentNumber: String(1010200300 + i * 137), phone: `31${String(10000000 + i * 7919).slice(0, 8)}`,
      email: `${firstName}.${lastName}`.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() + '@correo.com',
      birthDate: format(subMonths(today, 12 * (19 + (i * 3) % 25)), 'yyyy-MM-dd'),
      city: 'Bogotá', objective: ['Bajar de peso', 'Ganar masa muscular', 'Mejorar resistencia'][i % 3],
      joinedAt: format(joined, 'yyyy-MM-dd'),
    });

    const plan = plans[i % 3];
    const start = i < 2 ? subDays(today, plan.durationDays + 5) : subDays(today, (i * 4) % plan.durationDays);
    const end = addDays(start, plan.durationDays);
    const expiringSoon = i === 3 || i === 4;
    const membership = await ds.getRepository(Membership).save({
      gymId: gym.id, memberId: member.id, planId: plan.id,
      status: i < 2 ? MembershipStatus.EXPIRED : MembershipStatus.ACTIVE,
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(expiringSoon ? addDays(today, i) : end, 'yyyy-MM-dd'),
      pricePaid: plan.price, createdBy: admin.id,
    });

    // Historial de pagos de los últimos meses para que el dashboard tenga tendencia.
    for (let m = 0; m <= i % 6; m++) {
      await ds.getRepository(Payment).save({
        gymId: gym.id, memberId: member.id, membershipId: membership.id,
        paymentNumber: `TX-${today.getFullYear()}-${String(paymentSeq++).padStart(5, '0')}`, concept: PaymentConcept.MEMBERSHIP,
        amount: plans[0].price, discount: 0, total: plans[0].price,
        method: [PaymentMethod.CASH, PaymentMethod.TRANSFER, PaymentMethod.CARD][(i + m) % 3],
        status: PaymentStatus.COMPLETED, paidAt: subDays(subMonths(today, m), i % 5), createdBy: admin.id,
      });
    }

    // Asistencias de la última semana.
    for (let d = 0; d < 7; d++) {
      if ((i + d) % 3 === 0) continue;
      const checkin = subDays(today, d);
      checkin.setHours(6 + ((i + d) % 12), (i * 7) % 60, 0, 0);
      if (checkin > today) continue;
      await ds.getRepository(Attendance).save({
        gymId: gym.id, memberId: member.id, membershipId: membership.id,
        type: AttendanceType.CHECKIN, recordedAt: checkin, recordedBy: admin.id,
      });
    }
  }

  console.log('✅ Seed completado. Usuarios demo (contraseña: %s):', DEMO_PASSWORD);
  console.log('   admin@trainix.app · recepcion@trainix.app · coach@trainix.app');
  await ds.destroy();
}

run().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});
