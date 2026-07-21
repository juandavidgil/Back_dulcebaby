import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

findConsultations() {
  return this.prisma.plan.findMany({
    where: {
      isActive: true,
      type: 'CONSULTATION',
    },
    orderBy: {
      order: 'asc',
    },
  });
}

  async findGuides() {
    return this.prisma.plan.findMany({
      where: {
        type: 'GUIDE',
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }
}