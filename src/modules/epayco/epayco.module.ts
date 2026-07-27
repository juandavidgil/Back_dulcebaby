import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EpaycoService } from './epayco.service';

@Module({
  imports: [ConfigModule],
  providers: [EpaycoService],
  exports: [EpaycoService],
})
export class EpaycoModule {}