import { Body, Controller, Headers, HttpCode, Post, Req} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { PaymentsService } from './payments.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('create-checkout-session')
  @ApiOperation({
    summary: 'Crear una sesión de pago en Stripe',
  })
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.paymentsService.createCheckoutSession(dto);
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Req() request: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(
      request,
      signature,
    );
  }
}