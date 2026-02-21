import 'reflect-metadata';

import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3100);

    await app.listen(port);

    logger.log(`SHM Remnawave Agent is running on port ${port}`);
}

bootstrap();
