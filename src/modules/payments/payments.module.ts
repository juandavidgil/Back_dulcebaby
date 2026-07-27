import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { EpaycoModule } from '../epayco/epayco.module';

@Module({
imports: [
    PrismaModule,
    ConfigModule,
    EmailModule,
    EpaycoModule,
],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}