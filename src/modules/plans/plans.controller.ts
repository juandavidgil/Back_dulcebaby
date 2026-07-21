import { Controller, Get } from '@nestjs/common';
import { PlansService } from './plans.service';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get('consultations')
  findConsultations() {
    return this.plansService.findConsultations();
  }

  @Get('guides')
  findGuides() {
    return this.plansService.findGuides();
  }
}