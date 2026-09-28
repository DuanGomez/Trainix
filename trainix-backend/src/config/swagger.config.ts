import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, prefix: string): void {
  const config = new DocumentBuilder()
    .setTitle('Trainix API')
    .setDescription('API REST para la plataforma de gestión de gimnasios Trainix')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'JWT', in: 'header' },
      'JWT-auth',
    )
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Gyms', 'Gestión de gimnasios')
    .addTag('Users', 'Usuarios del staff')
    .addTag('Roles', 'Roles y permisos')
    .addTag('Members', 'Clientes del gimnasio')
    .addTag('Plans', 'Planes de membresía')
    .addTag('Memberships', 'Membresías')
    .addTag('Attendance', 'Control de asistencia')
    .addTag('Payments', 'Pagos')
    .addTag('Cash Register', 'Caja')
    .addTag('Routines', 'Rutinas de entrenamiento')
    .addTag('Reports', 'Reportes')
    .addTag('Dashboard', 'Métricas del dashboard')
    .addTag('Settings', 'Configuración del gimnasio')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
