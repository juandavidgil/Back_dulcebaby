import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment, Plan } from '@prisma/client';
import * as crypto from 'crypto';
//import { response } from 'express';

@Injectable()
export class EpaycoService {
  constructor(private readonly config: ConfigService) {}

  async createCheckout(payment: Payment, plan: Plan) {
    const publicKey = this.config.getOrThrow<string>('EPAYCO_PUBLIC_KEY');
    const customerId = this.config.getOrThrow<string>('EPAYCO_CUSTOMER_ID');
    const privateKey = this.config.getOrThrow<string>('EPAYCO_PRIVATE_KEY');
    const frontend = this.config.getOrThrow<string>('FRONTEND_URL');
    const backend = this.config.getOrThrow<string>('BACKEND_URL');

    /**
     * El monto ya viene definido en Payment
     * según la moneda seleccionada
     */
    const amount = payment.amount.toString();

    /**
     * Firma requerida por ePayco
     */
    const signature = crypto
      .createHash('sha256')
      .update(
        `${customerId}^${privateKey}^${payment.id}^${amount}^${payment.currency}`,
      )
      .digest('hex');

    return {
      // Configuración checkout
      key: publicKey,
      test,
      external: false,

      // Producto
      name: plan.name,
      description: plan.subtitle,

      invoice: payment.id,

      // Moneda y valor
      currency: payment.currency,
      amount,

      tax: '0',
      tax_base: '0',

      country: 'CO',
      lang: 'es',

      // URLs
      //response: `${frontend}/success`,
      confirmation: `${backend}/api/payments/confirmation`,

      // Referencias
      extra1: payment.id,
      extra2: plan.id,
      extra3: plan.type,

      signature,
    };
  }
}
