import { PrismaClient } from '@prisma/client';
import { prisma } from '../prisma';
     
   export async function seedPlans() {
        await prisma.plan.createMany({
            skipDuplicates: true,
            data: [ 
                {
                    name: 'Plan Descubre',
                    description:
                    'Una sesión de consultoría con evaluación inicial y recomendaciones personalizadas.',
                    price: 7900,
                    currency: 'USD',
                },
                {
                    name: 'Plan Bienestar',
                    description:
                    'Tres sesiones con seguimiento durante 30 días y plan personalizado.',
                    price: 19900,
                    currency: 'USD',
                },
                {
                    name: 'Plan Premium',
                    description:
                    'Seis sesiones, acompañamiento prioritario y soporte personalizado.',
                    price: 39900,
                    currency: 'USD',
                },
            ],
        });
        console.log('planes creados')
    }