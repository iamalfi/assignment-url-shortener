import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export async function setupDoc(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('URL Shortener Assignment')
    .setDescription(
      `
      The **URL Shortener** is a web application that allows users to shorten long URLs into easily shareable and memorable short links. 
      This service enhances the user experience by simplifying complex URLs, making them more convenient for sharing across various platforms, 
      and tracking the performance of the shortened links.

      **Key Features:**
      - **URL Shortening**: Users can convert long URLs into unique short codes that redirect to the original URLs when accessed.
      - **Analytics & Reporting**: Provides real-time insights into URL performance, including:
        - Total number of URLs created by the user.
        - The most accessed URL along with its click count.
        - The least accessed URL along with its click count.
      - **Click Tracking**: Tracks the number of times each shortened URL is accessed, providing valuable data for marketing or personal use.
      - **User Management**: Each user has a personalized dashboard to manage their shortened URLs, view analytics, and track performance.
      - **Secure & Scalable**: Designed for secure use, with user authentication, and scalable to handle a large number of URL shortener requests efficiently.    `,
    )
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
