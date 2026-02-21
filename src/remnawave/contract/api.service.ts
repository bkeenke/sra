import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import {
    CreateUserCommand,
    GetUserByUuidCommand,
    GetUserByUsernameCommand,
    GetUserByShortUuidCommand,
    UpdateUserCommand,
    DeleteUserCommand,
    EnableUserCommand,
    DisableUserCommand,
    ResetUserTrafficCommand,
    GetInternalSquadsCommand,
    REST_API,
} from '@remnawave/backend-contract';

import {
    ExtendedUser,
    UserSettings,
    USERS_STATUS,
    ApiResponse,
} from './types';

@Injectable()
export class RemnawaveApiService {
    constructor(private readonly httpService: HttpService) {}

    private async request<T>(
        apiHost: string,
        token: string,
        method: 'get' | 'post' | 'patch' | 'delete' | 'put',
        path: string,
        data?: unknown,
    ): Promise<T> {
        const url = `${apiHost}${path}`;

        try {
            const response = await firstValueFrom(
                this.httpService.request<T>({
                    method,
                    url,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    data,
                }),
            );

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError && error.response?.data) {
                throw new HttpException(error.response.data, error.response.status);
            }
            throw error;
        }
    }

    async createUser(
        apiHost: string,
        token: string,
        username: string,
        expireAt: string,
        settings?: UserSettings,
    ): Promise<ExtendedUser> {
        const payload: Record<string, unknown> = {
            username,
            expireAt,
            status: USERS_STATUS.ACTIVE,
        };

        if (settings) {
            if (settings.trafficLimitBytes !== undefined) {
                payload.trafficLimitBytes = settings.trafficLimitBytes;
            }
            if (settings.trafficLimitStrategy !== undefined) {
                payload.trafficLimitStrategy = settings.trafficLimitStrategy;
            }
            if (settings.hwidDeviceLimit !== undefined) {
                payload.hwidDeviceLimit = settings.hwidDeviceLimit;
            }
            if (settings.activeInternalSquads !== undefined) {
                payload.activeInternalSquads = settings.activeInternalSquads;
            }
            if (settings.externalSquadUuid !== undefined) {
                payload.externalSquadUuid = settings.externalSquadUuid;
            }
            if (settings.description !== undefined) {
                payload.description = settings.description;
            }
            if (settings.tag !== undefined) {
                payload.tag = settings.tag;
            }
            if (settings.telegramId !== undefined) {
                payload.telegramId = settings.telegramId;
            }
            if (settings.email !== undefined) {
                payload.email = settings.email;
            }
        }

        const response = await this.request<ApiResponse<ExtendedUser>>(
            apiHost,
            token,
            CreateUserCommand.endpointDetails.REQUEST_METHOD,
            CreateUserCommand.url,
            payload,
        );

        return response.response;
    }

    async getUserByUuid(apiHost: string, token: string, uuid: string): Promise<ExtendedUser> {
        const response = await this.request<ApiResponse<ExtendedUser>>(
            apiHost,
            token,
            GetUserByUuidCommand.endpointDetails.REQUEST_METHOD,
            REST_API.USERS.GET_BY_UUID(uuid),
        );
        return response.response;
    }

    async getUserByUsername(apiHost: string, token: string, username: string): Promise<ExtendedUser> {
        const response = await this.request<ApiResponse<ExtendedUser>>(
            apiHost,
            token,
            GetUserByUsernameCommand.endpointDetails.REQUEST_METHOD,
            REST_API.USERS.GET_BY.USERNAME(username),
        );
        return response.response;
    }

    async getUserByShortUuid(apiHost: string, token: string, shortUuid: string): Promise<ExtendedUser> {
        const response = await this.request<ApiResponse<ExtendedUser>>(
            apiHost,
            token,
            GetUserByShortUuidCommand.endpointDetails.REQUEST_METHOD,
            REST_API.USERS.GET_BY.SHORT_UUID(shortUuid),
        );
        return response.response;
    }

    async updateUser(
        apiHost: string,
        token: string,
        uuid: string,
        updates: Partial<UserSettings> & { expireAt?: string; status?: string },
    ): Promise<ExtendedUser> {
        const payload: Record<string, unknown> = { uuid };

        if (updates.expireAt !== undefined) {
            payload.expireAt = updates.expireAt;
        }
        if (updates.status !== undefined) {
            payload.status = updates.status;
        }
        if (updates.trafficLimitBytes !== undefined) {
            payload.trafficLimitBytes = updates.trafficLimitBytes;
        }
        if (updates.trafficLimitStrategy !== undefined) {
            payload.trafficLimitStrategy = updates.trafficLimitStrategy;
        }
        if (updates.hwidDeviceLimit !== undefined) {
            payload.hwidDeviceLimit = updates.hwidDeviceLimit;
        }
        if (updates.activeInternalSquads !== undefined) {
            payload.activeInternalSquads = updates.activeInternalSquads;
        }
        if (updates.externalSquadUuid !== undefined) {
            payload.externalSquadUuid = updates.externalSquadUuid;
        }
        if (updates.description !== undefined) {
            payload.description = updates.description;
        }
        if (updates.tag !== undefined) {
            payload.tag = updates.tag;
        }
        if (updates.telegramId !== undefined) {
            payload.telegramId = updates.telegramId;
        }
        if (updates.email !== undefined) {
            payload.email = updates.email;
        }

        const response = await this.request<ApiResponse<ExtendedUser>>(
            apiHost,
            token,
            UpdateUserCommand.endpointDetails.REQUEST_METHOD,
            UpdateUserCommand.url,
            payload,
        );

        return response.response;
    }

    async enableUser(apiHost: string, token: string, uuid: string): Promise<ExtendedUser> {
        const response = await this.request<ApiResponse<ExtendedUser>>(
            apiHost,
            token,
            EnableUserCommand.endpointDetails.REQUEST_METHOD,
            REST_API.USERS.ACTIONS.ENABLE(uuid),
        );
        return response.response;
    }

    async disableUser(apiHost: string, token: string, uuid: string): Promise<ExtendedUser> {
        const response = await this.request<ApiResponse<ExtendedUser>>(
            apiHost,
            token,
            DisableUserCommand.endpointDetails.REQUEST_METHOD,
            REST_API.USERS.ACTIONS.DISABLE(uuid),
        );
        return response.response;
    }

    async resetUserTraffic(apiHost: string, token: string, uuid: string): Promise<ExtendedUser> {
        const response = await this.request<ApiResponse<ExtendedUser>>(
            apiHost,
            token,
            ResetUserTrafficCommand.endpointDetails.REQUEST_METHOD,
            REST_API.USERS.ACTIONS.RESET_TRAFFIC(uuid),
        );
        return response.response;
    }

    async deleteUser(apiHost: string, token: string, uuid: string): Promise<void> {
        await this.request<ApiResponse<{ success: boolean }>>(
            apiHost,
            token,
            DeleteUserCommand.endpointDetails.REQUEST_METHOD,
            REST_API.USERS.DELETE(uuid),
        );
    }

    async getInternalSquads(
        apiHost: string,
        token: string,
    ): Promise<Array<{ uuid: string; tag: string }>> {
        const response = await this.request<ApiResponse<{
            internalSquads: Array<{ uuid: string; tag: string }>;
        }>>(apiHost, token, GetInternalSquadsCommand.endpointDetails.REQUEST_METHOD, REST_API.INTERNAL_SQUADS.GET);

        return response.response.internalSquads || [];
    }
}
