import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PaymentsService } from './payments.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-checkout-session')
  @ApiOperation({
    summary: 'Crear checkout de ePayco',
  })
  async createCheckoutSession(@Body() dto: CreateCheckoutSessionDto) {
    return this.paymentsService.createCheckoutSession(dto);
  }

  /**
   * Endpoint que ePayco llamará automáticamente
   * cuando el usuario termine el pago.
   */
  @Post('confirmation')
  @HttpCode(200)
  async confirmation(@Body() body: any) {
    console.log('=========== CONFIRMACION EPAYCO ===========');
    console.log(body);
    console.log('===========================================');

    return this.paymentsService.confirmation(body);
  }
}
