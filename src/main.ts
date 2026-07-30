import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);

  //El prefijo para los endpoints de la API
  app.setGlobalPrefix('api');
  //comuicación con el front
const allowedOrigins = (
  configService.get<string>('FRONTEND_URL') || ''
).split(',');

app.enableCors({
  origin: (origin, callback) => {
    // Permite herramientas como Postman o curl
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('No permitido por CORS'), false);
  },
  credentials: true,
});

  //validacion global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
  .setTitle('Dulce Baby API')
  .setDescription('API para la Landing Page de Dulce Baby')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);

  const port = configService.get<string>('PORT') ?? 4000;
  await app.listen(Number(port));
  console.log(`API ejecutandose en http://localhost:${port}/api`);
 
}
bootstrap();
