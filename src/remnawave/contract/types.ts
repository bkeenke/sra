export enum USERS_STATUS {
    ACTIVE = 'ACTIVE',
    DISABLED = 'DISABLED',
    LIMITED = 'LIMITED',
    EXPIRED = 'EXPIRED',
}

export enum RESET_PERIODS {
    NO_RESET = 'NO_RESET',
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR',
}

export enum TRAFFIC_LIMIT_STRATEGY {
    NO_RESET = 'NO_RESET',
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR',
}

export interface ExtendedUser {
    uuid: string;
    shortUuid: string;
    username: string;
    status: USERS_STATUS;
    usedTrafficBytes: bigint | string | number;
    lifetimeUsedTrafficBytes: bigint | string | number;
    trafficLimitBytes: bigint | string | number;
    trafficLimitStrategy: string;
    subLastUserAgent: string | null;
    subLastOpenedAt: Date | string | null;
    expireAt: Date | string;
    onlineAt: Date | string | null;
    subRevokedAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    lastTrafficResetAt: Date | string | null;
    trojanPassword: string;
    vlessUuid: string;
    ssPassword: string;
    subscriptionUuid: string;
    subscriptionUrl?: string;
    description: string | null;
    email: string | null;
    telegramId: bigint | string | number | null;
    hwidDeviceLimit: number | null;
    tag: string | null;
    externalSquadUuid?: string | null;
    activeInternalSquads?: Array<{ uuid: string; tag: string }>;
    enabledInbounds?: Array<{
        uuid: string;
        tag: string;
        type: string;
    }>;
    activeUserInbounds?: Array<{
        uuid: string;
        tag: string;
        type: string;
    }>;
    lastConnectedNode?: {
        uuid: string;
        name: string;
    } | null;
    billingStartDate?: Date | string | null;
}

export interface ApiResponse<T> {
    response: T;
}

export enum ShmEvent {
    CREATE = 'CREATE',
    ACTIVATE = 'ACTIVATE',
    BLOCK = 'BLOCK',
    REMOVE = 'REMOVE',
    PROLONGATE = 'PROLONGATE',
}

export interface ApiVersionInfo {
    version: string;
    major: number;
    minor: number;
    patch: number;
    build: {
        time: string;
        number: string;
    };
}

export interface OperationResult {
    success: boolean;
    response?: ExtendedUser;
    error?: string;
    apiVersion?: string;
}

export interface UserSettings {
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
