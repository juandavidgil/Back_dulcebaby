import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PlansModule } from './modules/plans/plans.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { EmailModule } from './modules/email/email.module';
import { EpaycoModule } from './modules/epayco/epayco.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    PlansModule,
    PaymentsModule,
    EmailModule,
    EpaycoModule,

  ],
})
export class AppModule {}
