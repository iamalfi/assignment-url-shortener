import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export async function setupDoc(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Nestjs')
    .setDescription('The nestjs api documentation')
    .setVersion('1.0')
    .addBearerAuth({
      name: 'Authorization for User',
      description: 'Bearer Token for User',
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // this
    },
  });
}
