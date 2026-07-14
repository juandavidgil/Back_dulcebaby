import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, Plan } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );
  }

  async createCheckoutSession(dto: CreateCheckoutSessionDto) {

    const plan = await this.getPlan(dto.planId);

    // Crear el registro del pago en estado PENDING
    const payment = await this.createPayment(plan);

    // Crear la sesión de Stripe
    const session = await this.createStripeCheckoutSession(
      payment,
      plan,
    );

    // Guardar el ID de la sesión de Stripe
    await this.prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        stripeSessionId: session.id,
      },
    });

    // Devolver la URL de Stripe al frontend
    return {
      checkoutUrl: session.url,
    };
  }

  private async getPlan(planId: string): Promise<Plan> {
    const plan = await this.prisma.plan.findUnique({
      where: {
        id: planId,
      },
    });

    if (!plan) {
      throw new NotFoundException('El plan no existe.');
    }

    if (!plan.isActive) {
      throw new BadRequestException('El plan no está disponible.');
    }

    return plan;
  }

  private async createPayment(plan: Plan): Promise<Payment> {
    return this.prisma.payment.create({
      data: {
        amount: plan.price,
        currency: plan.currency,
        status: 'PENDING',
        customerEmail: '',
        planId: plan.id,
      },
    });
  }

  private async createStripeCheckoutSession(
    payment: Payment,
    plan: Plan,
  ): Promise<Stripe.Checkout.Session> {
    return await this.stripe.checkout.sessions.create({
      mode: 'payment',

      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: plan.currency.toLowerCase(),
            unit_amount: plan.price,
            product_data: {
              name: plan.name,
              description: plan.description ?? '',
            },
          },
        },
      ],

      success_url: `${this.configService.getOrThrow(
        'FRONTEND_URL',
      )}/success`,

      cancel_url: `${this.configService.getOrThrow(
        'FRONTEND_URL',
      )}/cancel`,

      metadata: {
        paymentId: payment.id,
        planId: plan.id,
      },
    });
  }
}