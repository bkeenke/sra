import {
    IsString,
    IsOptional,
    IsNumber,
    IsArray,
    IsUUID,
    Min,
    MaxLength,
    MinLength,
    Matches,
    IsDateString,
    IsIn,
    IsBoolean,
} from 'class-validator';

import { RESET_PERIODS, USERS_STATUS } from '../contract';

const RESET_PERIOD_VALUES = Object.values(RESET_PERIODS);
const USERS_STATUS_VALUES = Object.values(USERS_STATUS);
type ResetPeriodType = (typeof RESET_PERIODS)[keyof typeof RESET_PERIODS];

export interface ApiCredentials {
    apiHost: string;
    token: string;
}

class UserSettingsDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    trafficLimitBytes?: number;

    @IsOptional()
    @IsIn(RESET_PERIOD_VALUES)
    trafficLimitStrategy?: ResetPeriodType;

    @IsOptional()
    @IsNumber()
    @Min(0)
    hwidDeviceLimit?: number | null;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    activeInternalSquads?: string[];

    @IsOptional()
    @IsUUID('4')
    externalSquadUuid?: string | null;

    @IsOptional()
    @IsString()
    description?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(16)
    @Matches(/^[A-Z0-9_]*$/, { message: 'Tag can only contain uppercase letters, numbers, underscores' })
    tag?: string | null;

    @IsOptional()
    @IsNumber()
    telegramId?: number | null;

    @IsOptional()
    @IsString()
    email?: string | null;
}

class UserIdentifierDto {
    @IsOptional()
    @IsUUID('4')
    uuid?: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(36)
    @Matches(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username can only contain letters, numbers, underscores and dashes'
    })
    username?: string;

    @IsOptional()
    @IsString()
    shortUuid?: string;
}

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    @MaxLength(36)
    @Matches(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username can only contain letters, numbers, underscores and dashes'
    })
    username: string;

    @IsOptional()
    @IsDateString()
    expireAt?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    trafficLimitBytes?: number;

    @IsOptional()
    @IsIn(RESET_PERIOD_VALUES)
    trafficLimitStrategy?: ResetPeriodType;

    @IsOptional()
    @IsNumber()
    @Min(0)
    hwidDeviceLimit?: number | null;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    activeInternalSquads?: string[];

    @IsOptional()
    @IsUUID('4')
    externalSquadUuid?: string | null;

    @IsOptional()
    @IsString()
    description?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(16)
    @Matches(/^[A-Z0-9_]*$/, { message: 'Tag can only contain uppercase letters, numbers, underscores' })
    tag?: string | null;

    @IsOptional()
    @IsNumber()
    telegramId?: number | null;

    @IsOptional()
    @IsString()
    email?: string | null;
}

export class ActivateUserDto extends UserIdentifierDto {
    @IsOptional()
    @IsDateString()
    expireAt?: string;

    @IsOptional()
    @IsBoolean()
    resetTraffic?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    trafficLimitBytes?: number;

    @IsOptional()
    @IsIn(RESET_PERIOD_VALUES)
    trafficLimitStrategy?: ResetPeriodType;

    @IsOptional()
    @IsNumber()
    @Min(0)
    hwidDeviceLimit?: number | null;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    activeInternalSquads?: string[];

    @IsOptional()
    @IsUUID('4')
    externalSquadUuid?: string | null;

    @IsOptional()
    @IsString()
    description?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(16)
    @Matches(/^[A-Z0-9_]*$/, { message: 'Tag can only contain uppercase letters, numbers, underscores' })
    tag?: string | null;

    @IsOptional()
    @IsNumber()
    telegramId?: number | null;

    @IsOptional()
    @IsString()
    email?: string | null;

    @IsOptional()
    @IsIn(USERS_STATUS_VALUES)
    status?: string;
}

export class BlockUserDto extends UserIdentifierDto {}

export class RemoveUserDto extends UserIdentifierDto {}

export class ProlongateUserDto extends UserIdentifierDto {
    @IsOptional()
    @IsDateString()
    expireAt?: string;

    @IsOptional()
    @IsBoolean()
    resetTraffic?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    trafficLimitBytes?: number;

    @IsOptional()
    @IsIn(RESET_PERIOD_VALUES)
    trafficLimitStrategy?: ResetPeriodType;

    @IsOptional()
    @IsNumber()
    @Min(0)
    hwidDeviceLimit?: number | null;

    @IsOptional()
    @IsArray()
    @IsUUID('4', { each: true })
    activeInternalSquads?: string[];

    @IsOptional()
    @IsUUID('4')
    externalSquadUuid?: string | null;

    @IsOptional()
    @IsString()
    description?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(16)
    @Matches(/^[A-Z0-9_]*$/, { message: 'Tag can only contain uppercase letters, numbers, underscores' })
    tag?: string | null;

    @IsOptional()
    @IsNumber()
    telegramId?: number | null;

    @IsOptional()
    @IsString()
    email?: string | null;
}

export class GetUserRequestDto {
    @IsOptional()
    @IsUUID('4')
    uuid?: string;
    @IsOptional()
    @IsString()
    username?: string;
    @IsOptional()
    @IsString()
    shortUuid?: string;
}
