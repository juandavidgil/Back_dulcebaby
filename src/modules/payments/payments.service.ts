import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EpaycoService } from '../epayco/epayco.service';
import { Payment, Plan } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly epaycoService: EpaycoService,
  ) {}

  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    const plan = await this.getPlan(dto.planId);

    const payment = await this.createPayment(plan, dto.currency);

    const checkout = await this.epaycoService.createCheckout(payment, plan);

    return checkout;
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

  private async createPayment(
    plan: Plan,
    currency: 'COP' | 'USD',
  ): Promise<Payment> {
    const amount = currency === 'COP' ? plan.priceCop : plan.priceUsd;

    return this.prisma.payment.create({
      data: {
        amount,
        currency,
        status: 'PENDING',
        customerEmail: '',
        gateway: 'EPAYCO',
        reference: crypto.randomUUID(),
        planId: plan.id,
      },
    });
  }

  async confirmation(data: any) {
    if (data.x_cod_response !== '1') {
      return {
        success: false,
      };
    }

    const payment = await this.prisma.payment.findUnique({
      where: {
        id: data.x_extra1,
      },
      include: {
        plan: true,
      },
    });

    if (!payment) {
      return {
        success: false,
      };
    }

    if (payment.status === 'PAID') {
      return {
        success: true,
      };
    }

    const updatedPayment = await this.prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status: 'PAID',
        customerName: data.x_customer_name,
        customerEmail: data.x_customer_email,
        transactionId: data.x_transaction_id,
        paymentMethod: data.x_franchise,
        receiptUrl: data.x_url_invoice,
        paidAt: new Date(),
      },
    });

    if (payment.plan.type === 'GUIDE') {
      await this.emailService.sendGuideEmail({
        email: updatedPayment.customerEmail!,
        name: updatedPayment.customerName ?? 'Cliente',
        guide: payment.plan.name,
        pdfFile: payment.plan.pdfFile!,
      });
    } else {
      await this.emailService.sendConsultationEmail({
        email: updatedPayment.customerEmail!,
        name: updatedPayment.customerName ?? 'Cliente',
        plan: payment.plan.name,
        amount: updatedPayment.amount,
        currency: updatedPayment.currency,
        receipt: updatedPayment.receiptUrl ?? '',
      });
    }

    return {
      success: true,
    };
  }
}
