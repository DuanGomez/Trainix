# Trainix — Gestión de gimnasios

Diseñado y desarrollado por **[Dcodea](https://www.instagram.com/dcod.ea/)**.

Plataforma para administrar un gimnasio: clientes, planes, membresías, pagos, caja,
control de asistencia (check-in / check-out), rutinas, reportes y usuarios por rol.

**Demo en vivo:** se publica automáticamente en GitHub Pages al hacer push a `main`.
La demo funciona sin servidor: la API se simula en el navegador y los datos se guardan
en `localStorage` (cada visitante tiene su propia copia).

| Usuario demo | Rol | Contraseña |
|---|---|---|
| admin@trainix.app | Administrador | `Trainix2024!` |
| recepcion@trainix.app | Recepción | `Trainix2024!` |
| coach@trainix.app | Entrenador | `Trainix2024!` |

## Stack

- **Frontend:** Angular 20 (standalone, signals, lazy routes), Angular Material.
- **Backend:** NestJS 10, TypeORM, SQLite (better-sqlite3), JWT con refresh tokens, Swagger.
- **CI/CD:** GitHub Actions (build del backend y del frontend, despliegue a Pages).

## Estructura

```
trainix-backend/    API REST NestJS (módulos: auth, members, memberships, payments,
                    attendance, cash-register, plans, routines, reports, users, roles…)
trainix-frontend/   SPA Angular
  src/app/core/demo/   backend simulado para la demo (misma API que trainix-backend)
.github/workflows/  CI y despliegue a GitHub Pages
```

## Ejecutar en local

Requisitos: Node.js 20.19+ (o 22+). No hace falta instalar ninguna base de datos.

### Solo el frontend (modo demo)

```bash
cd trainix-frontend
npm install
npm start            # http://localhost:4200 — API simulada, igual que en GitHub Pages
```

### Frontend + API real

```bash
# Terminal 1 — API
cd trainix-backend
npm install
cp .env.example .env     # opcional: sin .env usa valores de desarrollo
npm run seed             # crea data/trainix.sqlite con datos de ejemplo
npm run start:dev        # http://localhost:3000/api/v1 — Swagger en /docs

# Terminal 2 — frontend
cd trainix-frontend
npm run start:api        # http://localhost:4200 contra la API local
```

Para empezar de cero, borra `trainix-backend/data/` y vuelve a ejecutar `npm run seed`.

## Flujo principal

1. **Clientes:** alta con código automático (`TX-0001`, `TX-0002`…).
2. **Membresías:** se asigna un plan; queda *pendiente de pago*.
3. **Pagos:** al registrar el pago de membresía, esta pasa a *activa*. Los pagos en
   efectivo requieren una caja abierta y quedan asociados a esa sesión.
4. **Check-in:** por código, documento o ID; solo con membresía activa y sin check-in abierto ese día.
5. **Caja:** al cerrar se compara el efectivo contado con el esperado (apertura + pagos en efectivo).
6. **Reportes:** ingresos por método y concepto en un rango de fechas, exportables a Excel.

## Despliegue en GitHub Pages

1. Sube el repositorio a GitHub.
2. En **Settings → Pages → Build and deployment**, elige **Source: GitHub Actions**.
3. Cada push a `main` ejecuta `.github/workflows/deploy-pages.yml` y publica en
   `https://<usuario>.github.io/<repositorio>/`.
