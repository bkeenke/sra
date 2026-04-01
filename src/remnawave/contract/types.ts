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
    MONTH_ROLLING = 'MONTH_ROLLING',
}

export enum TRAFFIC_LIMIT_STRATEGY {
    NO_RESET = 'NO_RESET',
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    MONTH_ROLLING = 'MONTH_ROLLING',
}

export interface UserTraffic {
    usedTrafficBytes: number;
    lifetimeUsedTrafficBytes: number;
    onlineAt: Date | string | null;
    firstConnectedAt: Date | string | null;
    lastConnectedNodeUuid: string | null;
}

export interface ExtendedUser {
    uuid: string;
    id: number;
    shortUuid: string;
    username: string;
    status: USERS_STATUS;
    trafficLimitBytes: number;
    trafficLimitStrategy: string;
    expireAt: Date | string;
    subRevokedAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    lastTrafficResetAt: Date | string | null;
    trojanPassword: string;
    vlessUuid: string;
    ssPassword: string;
    lastTriggeredThreshold: number;
    subscriptionUrl: string;
    description: string | null;
    email: string | null;
    telegramId: number | null;
    hwidDeviceLimit: number | null;
    tag: string | null;
    externalSquadUuid: string | null;
    activeInternalSquads: Array<{ uuid: string; name: string }>;
    userTraffic: UserTraffic;
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
