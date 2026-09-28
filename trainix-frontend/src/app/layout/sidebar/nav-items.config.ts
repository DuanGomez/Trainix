export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/dashboard',
  },
  {
    label: 'Check-in',
    icon: 'login',
    route: '/attendance',
    roles: ['super_admin', 'gym_admin', 'receptionist'],
  },
  {
    label: 'Clientes',
    icon: 'people',
    route: '/members',
    roles: ['super_admin', 'gym_admin', 'receptionist', 'trainer'],
  },
  {
    label: 'Membresías',
    icon: 'card_membership',
    route: '/memberships',
    roles: ['super_admin', 'gym_admin', 'receptionist'],
  },
  {
    label: 'Planes',
    icon: 'assignment',
    route: '/plans',
    roles: ['super_admin', 'gym_admin'],
  },
  {
    label: 'Pagos',
    icon: 'payments',
    route: '/payments',
    roles: ['super_admin', 'gym_admin', 'receptionist'],
  },
  {
    label: 'Caja',
    icon: 'point_of_sale',
    route: '/cash-register',
    roles: ['super_admin', 'gym_admin', 'receptionist'],
  },
  {
    label: 'Rutinas',
    icon: 'fitness_center',
    route: '/routines',
    roles: ['super_admin', 'gym_admin', 'trainer'],
  },
  {
    label: 'Reportes',
    icon: 'bar_chart',
    route: '/reports',
    roles: ['super_admin', 'gym_admin'],
  },
  {
    label: 'Usuarios',
    icon: 'manage_accounts',
    route: '/users',
    roles: ['super_admin', 'gym_admin'],
  },
  {
    label: 'Roles',
    icon: 'security',
    route: '/roles',
    roles: ['super_admin', 'gym_admin'],
  },
  {
    label: 'Configuración',
    icon: 'settings',
    route: '/settings',
    roles: ['super_admin', 'gym_admin'],
  },
];
