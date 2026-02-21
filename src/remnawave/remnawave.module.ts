import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { RemnawaveService } from './remnawave.service';
import { RemnawaveController } from './remnawave.controller';
import { RemnawaveApiService } from './contract';

@Module({
    imports: [
        HttpModule.register({
            timeout: 30000,
            maxRedirects: 5,
        }),
    ],
    controllers: [RemnawaveController],
    providers: [RemnawaveService, RemnawaveApiService],
    exports: [RemnawaveService, RemnawaveApiService],
})
export class RemnawaveModule {}
