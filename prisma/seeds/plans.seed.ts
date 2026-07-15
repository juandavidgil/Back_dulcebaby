import { PrismaClient } from '@prisma/client';
import { prisma } from '../prisma';

export async function seedPlans() {
  await prisma.plan.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Dulce Comienzo',
        subtitle: 'Un solo encuentro para comenzar con tranquilidad.',
        ageRange: '0–4 meses',
        description:
          'Sé que apenas estás llegando a la maternidad y todo se siente nuevo, incluso confuso. En una sola sesión te ayudo a entender el sueño de tu bebé recién nacido, para que actúes con calma y confianza.',
        includes: [
          'Consulta inicial de 90 minutos',
          'Sueño del recién nacido: qué esperar',
          'Ambiente de sueño seguro',
          'Señales de sueño y alimentación',
        ],
        duration: 'Sin seguimiento',
        price: 3900,
        currency: 'USD',
        priceCop: 134000,
        buttonText: 'Quiero preparar este comienzo',
        featured: false,
        order: 1,
        isActive: true,
      },
      {
        name: 'Dulce Comienzo Plus',
        subtitle: 'Acompañamiento continuo durante los primeros meses.',
        ageRange: '0–4 meses',
        description:
          'Si sientes que necesitas más que una conversación, que quieres sentirte acompañada mientras tu bebé crece. Te doy las bases del sueño de tu recién nacido y me quedo cerca hasta que cumpla los 4 meses, resolviendo tus dudas en el camino.',
        includes: [
          'Todo lo de Dulce Comienzo',
          'Seguimiento continuo hasta los 4 meses',
          'Acompañamiento emocional',
          'Guía descargable 0-4 meses',
        ],
        duration: 'Seguimiento hasta los 4 meses',
        price: 9900,
        currency: 'USD',
        priceCop: 340000,
        buttonText: 'Quiero sentirme acompañada desde el inicio',
        featured: true,
        order: 2,
        isActive: true,
      },
      {
        name: 'Consulta 1:1',
        subtitle: 'Evaluación personalizada del sueño.',
        ageRange: '5+ meses',
        description:
          'Ya conoces a tu hij@, pero sientes que te falta claridad para dar el siguiente paso. Evaluamos juntas su sueño y rutinas, y te llevas un plan escrito para aplicar a tu ritmo, sin compromiso de seguimiento.',
        includes: [
          'Consulta inicial de 90 minutos',
          'Evaluación de sueño, rutinas y alimentación',
          'Ambiente de sueño seguro',
          'Ventanas de sueño por edad',
        ],
        duration: 'Sin acompañamiento',
        price: 8000,
        currency: 'USD',
        priceCop: 275000,
        buttonText: 'Quiero entender qué necesita mi bebé',
        featured: false,
        order: 3,
        isActive: true,
      },
      {
        name: 'Plan Luna',
        subtitle: 'Plan de sueño personalizado con seguimiento.',
        ageRange: '5+ meses',
        description:
          'Estás agotada, tu bebé solo duerme en brazos y sientes que ya no puedes sola. Diseño un plan de sueño 100% personalizado y te acompaño por WhatsApp durante 15 días, con un método gradual y respetuoso, a tu ritmo.',
        includes: [
          'Consulta inicial de 90 minutos',
          'Plan de sueño 100% personalizado',
          'Acompañamiento por WhatsApp',
          'Método gradual y respetuoso',
        ],
        duration: 'Acompañamiento por 15 días',
        price: 15000,
        currency: 'USD',
        priceCop: 515000,
        buttonText: 'Quiero volver a descansar',
        featured: true,
        order: 4,
        isActive: true,
      },
      {
        name: 'Plan Luna Premium',
        subtitle: 'Acompañamiento intensivo durante un mes.',
        ageRange: '5+ meses',
        description:
          'La situación se siente más compleja y necesitas una mano cercana que entienda cada detalle. Nos vemos por videollamada cada semana durante un mes, con acompañamiento emocional para ti y tu pareja y herramientas para los momentos más difíciles.',
        includes: [
          '1 videollamada semanal (4 semanas)',
          'Plan de sueño 100% personalizado',
          'WhatsApp prioritario',
          'Acompañamiento emocional para mamá y papá',
        ],
        duration: 'Acompañamiento por 30 días',
        price: 25000,
        currency: 'USD',
        priceCop: 860000,
        buttonText: 'Quiero transformar nuestras noches',
        featured: true,
        order: 5,
        isActive: true,
      },
    ],
  });
  console.log('planes creados');
}
