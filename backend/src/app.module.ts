import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_GUARD } from '@nestjs/core';
import { FirebaseAdminModule } from './auth/firebase-admin.module';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import { PedidosModule } from './pedidos/pedidos.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';

/** Root application module wiring configuration, database, auth and feature modules. */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        // Disable automatic index rebuilding in production to avoid performance overhead
        autoIndex: config.get<string>('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    FirebaseAdminModule,
    PedidosModule,
    UsersModule,
    DashboardModule,
    HealthModule,
  ],
  providers: [
    // Register FirebaseAuthGuard globally so every route is protected by default
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
