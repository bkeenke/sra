import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

import { Semaphore } from '../common';
import {
    RemnawaveApiService,
    OperationResult,
    ExtendedUser,
    UserSettings,
    USERS_STATUS,
} from './contract';
import {
    CreateUserDto,
    ActivateUserDto,
    BlockUserDto,
    RemoveUserDto,
    ProlongateUserDto,
    ApiCredentials,
} from './dto';

interface RequestWithExpire {
    expireAt?: string;
}

interface RequestWithSettings {
    trafficLimitBytes?: number;
    trafficLimitStrategy?: string;
    hwidDeviceLimit?: number | null;
    activeInternalSquads?: string[];
    externalSquadUuid?: string | null;
    description?: string | null;
    tag?: string | null;
    telegramId?: number | null;
    email?: string | null;
}

function normalizeDate(dateStr: string): string {
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
        return dateStr;
    }

    const [, yearStr, monthStr, dayStr] = match;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    const lastDayOfMonth = new Date(year, month, 0).getDate();

    if (day > lastDayOfMonth) {
        const correctedDay = String(lastDayOfMonth).padStart(2, '0');
        return dateStr.replace(/^(\d{4}-\d{2})-\d{2}/, `$1-${correctedDay}`);
    }

    return dateStr;
}

@Injectable()
export class RemnawaveService {
    private readonly logger = new Logger(RemnawaveService.name);
    private readonly semaphore = new Semaphore();

    constructor(
        private readonly apiService: RemnawaveApiService,
    ) {}

    async createUser(credentials: ApiCredentials, request: CreateUserDto): Promise<OperationResult> {
        return this.semaphore.run(async () => {
            this.logger.log(`Processing CREATE for ${request.username}`);

            try {
                const expireAt = this.calculateExpireAt(request);

                const settings = this.extractSettings(request);

                if (!settings.activeInternalSquads) {
                    const squads = await this.apiService.getInternalSquads(credentials.apiHost, credentials.token);
                    settings.activeInternalSquads = squads.map((s) => s.uuid);
                }

                this.logger.debug('Create user settings:', settings);

                const user = await this.apiService.createUser(
                    credentials.apiHost,
                    credentials.token,
                    request.username,
                    expireAt,
                    settings,
                );

                return {
                    success: true,
                    response: user,
                };
            } catch (error) {
                this.logger.error('Error processing CREATE:', error);
                if (error instanceof HttpException) {
                    throw error;
                }
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        });
    }

    async activateUser(credentials: ApiCredentials, request: ActivateUserDto): Promise<OperationResult> {
        return this.semaphore.run(async () => {
            this.logger.log(`Processing ACTIVATE for ${request.username || request.uuid}`);

            try {
                const currentUser = await this.getUser(credentials, request);

                if (
                    currentUser.status === USERS_STATUS.ACTIVE &&
                    !this.hasSettingsFields(request) &&
                    !request.expireAt
                ) {
                    this.logger.debug('User already active, no changes needed');
                    return {
                        success: true,
                        response: currentUser,
                    };
                }

                if (currentUser.status !== USERS_STATUS.ACTIVE) {
                    await this.apiService.enableUser(credentials.apiHost, credentials.token, currentUser.uuid);
                }

                if (request.resetTraffic) {
                    await this.apiService.resetUserTraffic(credentials.apiHost, credentials.token, currentUser.uuid);
                }

                const needsUpdate = this.needsSettingsUpdate(currentUser, request);
                let updatedUser = currentUser;
                const hasExpireUpdate = request.expireAt;

                if (needsUpdate || hasExpireUpdate) {
                    const updates: Partial<UserSettings> & { expireAt?: string; status?: string } = {
                        status: USERS_STATUS.ACTIVE,
                    };

                    if (hasExpireUpdate) {
                        updates.expireAt = this.calculateExpireAt(request);
                    }

                    if (this.hasSettingsFields(request)) {
                        Object.assign(updates, this.extractSettings(request));
                    }

                    updatedUser = await this.apiService.updateUser(
                        credentials.apiHost,
                        credentials.token,
                        currentUser.uuid,
                        updates,
                    );
                }

                return {
                    success: true,
                    response: updatedUser,
                };
            } catch (error) {
                this.logger.error('Error processing ACTIVATE:', error);
                if (error instanceof HttpException) {
                    throw error;
                }
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        });
    }

    async blockUser(credentials: ApiCredentials, request: BlockUserDto): Promise<OperationResult> {
        return this.semaphore.run(async () => {
            this.logger.log(`Processing BLOCK for ${request.username || request.uuid}`);

            try {
                const currentUser = await this.getUser(credentials, request);

                if (currentUser.status === USERS_STATUS.DISABLED) {
                    this.logger.debug('User already disabled');
                    return {
                        success: true,
                        response: currentUser,
                    };
                }

                const disabledUser = await this.apiService.disableUser(
                    credentials.apiHost,
                    credentials.token,
                    currentUser.uuid,
                );

                return {
                    success: true,
                    response: disabledUser,
                };
            } catch (error) {
                this.logger.error('Error processing BLOCK:', error);
                if (error instanceof HttpException) {
                    throw error;
                }
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        });
    }

    async removeUser(credentials: ApiCredentials, request: RemoveUserDto): Promise<OperationResult> {
        return this.semaphore.run(async () => {
            this.logger.log(`Processing REMOVE for ${request.username || request.uuid}`);

            try {
                const currentUser = await this.getUser(credentials, request);

                await this.apiService.deleteUser(credentials.apiHost, credentials.token, currentUser.uuid);

                return {
                    success: true,
                };
            } catch (error) {
                this.logger.error('Error processing REMOVE:', error);
                if (error instanceof HttpException) {
                    throw error;
                }
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        });
    }

    async prolongateUser(credentials: ApiCredentials, request: ProlongateUserDto): Promise<OperationResult> {
        return this.semaphore.run(async () => {
            this.logger.log(`Processing PROLONGATE for ${request.username || request.uuid}`);

            try {
                const currentUser = await this.getUser(credentials, request);

                if (request.resetTraffic) {
                    await this.apiService.resetUserTraffic(credentials.apiHost, credentials.token, currentUser.uuid);
                }

                const needsUpdate = this.needsSettingsUpdate(currentUser, request);

                const hasExpireUpdate = request.expireAt;

                if (!needsUpdate && !hasExpireUpdate) {
                    this.logger.debug('No changes needed for PROLONGATE');
                    return {
                        success: true,
                        response: currentUser,
                    };
                }

                const updates: Partial<UserSettings> & { expireAt?: string } = {};

                if (hasExpireUpdate) {
                    updates.expireAt = this.calculateExpireAt(request);
                }

                if (this.hasSettingsFields(request)) {
                    Object.assign(updates, this.extractSettings(request));
                }

                const updatedUser = await this.apiService.updateUser(
                    credentials.apiHost,
                    credentials.token,
                    currentUser.uuid,
                    updates,
                );

                return {
                    success: true,
                    response: updatedUser,
                };
            } catch (error) {
                this.logger.error('Error processing PROLONGATE:', error);
                if (error instanceof HttpException) {
                    throw error;
                }
                return {
                    success: false,
                    error: error instanceof Error ? error.message : String(error),
                };
            }
        });
    }

    async getUser(
        credentials: ApiCredentials,
        request: { uuid?: string; username?: string; shortUuid?: string },
    ): Promise<ExtendedUser> {
        if (request.uuid) {
            return this.apiService.getUserByUuid(credentials.apiHost, credentials.token, request.uuid);
        }
        if (request.username) {
            return this.apiService.getUserByUsername(credentials.apiHost, credentials.token, request.username);
        }
        if (request.shortUuid) {
            return this.apiService.getUserByShortUuid(credentials.apiHost, credentials.token, request.shortUuid);
        }

        throw new HttpException('UUID, username, or shortUuid is required', HttpStatus.BAD_REQUEST);
    }

    private calculateExpireAt(request: RequestWithExpire): string {
        if (request.expireAt) {
            return normalizeDate(request.expireAt);
        }
        return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }

    private hasSettingsFields(request: RequestWithSettings): boolean {
        return (
            request.trafficLimitBytes !== undefined ||
            request.trafficLimitStrategy !== undefined ||
            request.hwidDeviceLimit !== undefined ||
            request.activeInternalSquads !== undefined ||
            request.externalSquadUuid !== undefined ||
            request.description !== undefined ||
            request.tag !== undefined ||
            request.telegramId !== undefined ||
            request.email !== undefined
        );
    }

    private extractSettings(request: RequestWithSettings): UserSettings {
        const settings: UserSettings = {};

        if (request.trafficLimitBytes !== undefined) {
            settings.trafficLimitBytes = request.trafficLimitBytes;
        }
        if (request.trafficLimitStrategy !== undefined) {
            settings.trafficLimitStrategy = request.trafficLimitStrategy;
        }
        if (request.hwidDeviceLimit !== undefined) {
            settings.hwidDeviceLimit = request.hwidDeviceLimit;
        }
        if (request.activeInternalSquads !== undefined) {
            settings.activeInternalSquads = request.activeInternalSquads;
        }
        if (request.externalSquadUuid !== undefined) {
            settings.externalSquadUuid = request.externalSquadUuid;
        }
        if (request.description !== undefined) {
            settings.description = request.description;
        }
        if (request.tag !== undefined) {
            settings.tag = request.tag;
        }
        if (request.telegramId !== undefined) {
            settings.telegramId = request.telegramId;
        }
        if (request.email !== undefined) {
            settings.email = request.email;
        }

        return settings;
    }

    private needsSettingsUpdate(currentUser: ExtendedUser, request: RequestWithSettings): boolean {
        if (!this.hasSettingsFields(request)) {
            return false;
        }

        const requestTrafficBytes = request.trafficLimitBytes;

        if (
            requestTrafficBytes !== undefined &&
            requestTrafficBytes !== currentUser.trafficLimitBytes
        ) {
            return true;
        }
        if (
            request.trafficLimitStrategy !== undefined &&
            request.trafficLimitStrategy !== currentUser.trafficLimitStrategy
        ) {
            return true;
        }
        if (
            request.hwidDeviceLimit !== undefined &&
            request.hwidDeviceLimit !== currentUser.hwidDeviceLimit
        ) {
            return true;
        }
        if (
            request.externalSquadUuid !== undefined &&
            request.externalSquadUuid !== currentUser.externalSquadUuid
        ) {
            return true;
        }
        if (request.description !== undefined && request.description !== currentUser.description) {
            return true;
        }
        if (request.tag !== undefined && request.tag !== currentUser.tag) {
            return true;
        }
        if (request.telegramId !== undefined && request.telegramId !== currentUser.telegramId) {
            return true;
        }
        if (request.email !== undefined && request.email !== currentUser.email) {
            return true;
        }

        if (request.activeInternalSquads !== undefined && currentUser.activeInternalSquads) {
            const currentSquads = currentUser.activeInternalSquads
                .map((sq: { uuid: string }) => sq.uuid)
                .sort();
            const newSquads = [...request.activeInternalSquads].sort();
            if (JSON.stringify(currentSquads) !== JSON.stringify(newSquads)) {
                return true;
            }
        }

        return false;
    }

    getQueueStatus(): { isProcessing: boolean; queueLength: number } {
        return {
            isProcessing: this.semaphore.isLocked,
            queueLength: this.semaphore.queueLength,
        };
    }
}
