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

async handleWebhook(
  request: any,
  signature: string,
) {
  const event = this.stripe.webhooks.constructEvent(
    request.rawBody,
    signature,
    this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentId = session.metadata?.paymentId;

      if (!paymentId) {
        return { received: true };
      }

      const payment = await this.prisma.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

      if (!payment) {
        return { received: true };
      }

      if (payment.status === 'PAID') {
        return { received: true };
      }

      const paymentIntent =
        typeof session.payment_intent === 'string'
          ? await this.stripe.paymentIntents.retrieve(
              session.payment_intent,
            )
          : null;

      const charge =
        paymentIntent?.latest_charge &&
        typeof paymentIntent.latest_charge === 'string'
          ? await this.stripe.charges.retrieve(
              paymentIntent.latest_charge,
            )
          : null;

      await this.prisma.payment.update({
        where: {
          id: paymentId,
        },
        data: {
          status: 'PAID',

          stripeEventId: event.id,

          stripeStatus:
            paymentIntent?.status ?? session.status ?? null,

          paymentIntentId:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : null,

          stripeCustomerId:
            typeof session.customer === 'string'
              ? session.customer
              : null,

          customerEmail:
            session.customer_details?.email ?? null,

          customerName:
            session.customer_details?.name ?? null,

          paymentMethod:
            charge?.payment_method_details?.type ?? null,

          cardBrand:
            charge?.payment_method_details?.card?.brand ?? null,

          cardLast4:
            charge?.payment_method_details?.card?.last4 ?? null,

          receiptUrl:
            charge?.receipt_url ?? null,

          paidAt: new Date(),
        },
      });

      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentId = session.metadata?.paymentId;

      if (paymentId) {
        await this.prisma.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: 'FAILED',
            stripeStatus: 'expired',
          },
        });
      }

      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;

      await this.prisma.payment.updateMany({
        where: {
          paymentIntentId: intent.id,
        },
        data: {
          status: 'FAILED',
          stripeStatus: intent.status,
        },
      });

      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;

      if (typeof charge.payment_intent === 'string') {
        await this.prisma.payment.updateMany({
          where: {
            paymentIntentId: charge.payment_intent,
          },
          data: {
            status: 'REFUNDED',
            stripeStatus: 'refunded',
          },
        });
      }

      break;
    }

    default:
      console.log(`Evento no manejado: ${event.type}`);
      break;
  }

  return {
    received: true,
  };
}
}