import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

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
    description:
      'Recibe el plan seleccionado y crea una Checkout Session en Stripe.',
  })
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.paymentsService.createCheckoutSession(dto);
  }
}