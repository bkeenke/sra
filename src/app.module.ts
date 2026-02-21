import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { RemnawaveModule } from './remnawave/remnawave.module';
import { HealthController } from './health/health.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local'],
        }),
        HttpModule.register({
            timeout: 30000,
            maxRedirects: 5,
        }),
        RemnawaveModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
