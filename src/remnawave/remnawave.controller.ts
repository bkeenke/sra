import { Controller, Post, Get, Body, Headers, HttpCode, HttpStatus, Logger, BadRequestException } from '@nestjs/common';

import { RemnawaveService } from './remnawave.service';
import {
    CreateUserDto,
    ActivateUserDto,
    BlockUserDto,
    RemoveUserDto,
    ProlongateUserDto,
    GetUserRequestDto,
    ApiCredentials,
} from './dto';
import { OperationResult, ExtendedUser } from './contract';

@Controller('api')
export class RemnawaveController {
    private readonly logger = new Logger(RemnawaveController.name);

    constructor(
        private readonly remnawaveService: RemnawaveService,
    ) {}

    private extractCredentials(headers: Record<string, string>): ApiCredentials {
        const apiHost = headers['x-api-host'];
        const token = headers['x-api-token'];

        if (!apiHost || !token) {
            throw new BadRequestException('Missing required headers: X-Api-Host and X-Api-Token');
        }

        return { apiHost, token };
    }

    @Post('create')
    @HttpCode(HttpStatus.OK)
    async createUser(
        @Headers() headers: Record<string, string>,
        @Body() request: CreateUserDto,
    ): Promise<OperationResult> {
        const credentials = this.extractCredentials(headers);
        this.logger.log(`Received CREATE request for ${request.username}`);
        return this.remnawaveService.createUser(credentials, request);
    }

    @Post('activate')
    @HttpCode(HttpStatus.OK)
    async activateUser(
        @Headers() headers: Record<string, string>,
        @Body() request: ActivateUserDto,
    ): Promise<OperationResult> {
        const credentials = this.extractCredentials(headers);
        this.logger.log(`Received ACTIVATE request for ${request.username || request.uuid}`);
        return this.remnawaveService.activateUser(credentials, request);
    }

    @Post('block')
    @HttpCode(HttpStatus.OK)
    async blockUser(
        @Headers() headers: Record<string, string>,
        @Body() request: BlockUserDto,
    ): Promise<OperationResult> {
        const credentials = this.extractCredentials(headers);
        this.logger.log(`Received BLOCK request for ${request.username || request.uuid}`);
        return this.remnawaveService.blockUser(credentials, request);
    }

    @Post('remove')
    @HttpCode(HttpStatus.OK)
    async removeUser(
        @Headers() headers: Record<string, string>,
        @Body() request: RemoveUserDto,
    ): Promise<OperationResult> {
        const credentials = this.extractCredentials(headers);
        this.logger.log(`Received REMOVE request for ${request.username || request.uuid}`);
        return this.remnawaveService.removeUser(credentials, request);
    }

    @Post('prolongate')
    @HttpCode(HttpStatus.OK)
    async prolongateUser(
        @Headers() headers: Record<string, string>,
        @Body() request: ProlongateUserDto,
    ): Promise<OperationResult> {
        const credentials = this.extractCredentials(headers);
        this.logger.log(`Received PROLONGATE request for ${request.username || request.uuid}`);
        return this.remnawaveService.prolongateUser(credentials, request);
    }

    @Post('user')
    @HttpCode(HttpStatus.OK)
    async getUser(
        @Headers() headers: Record<string, string>,
        @Body() request: GetUserRequestDto,
    ): Promise<{ success: boolean; response: ExtendedUser }> {
        const credentials = this.extractCredentials(headers);
        const user = await this.remnawaveService.getUser(credentials, request);
        return { success: true, response: user };
    }

    @Get('status')
    getStatus(): {
        success: boolean;
        response: { service: string; queue: { isProcessing: boolean; queueLength: number } };
    } {
        return {
            success: true,
            response: {
                service: 'shm-remnawave-agent',
                queue: this.remnawaveService.getQueueStatus(),
            },
        };
    }
}
