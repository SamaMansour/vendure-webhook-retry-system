import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between, DeepPartial } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

export interface CreateAuditLogInput {
    userId?: string;
    actionType: string;
    entityType: string;
    entityId: string;
    oldValue?: Record<string, any> | null;
    newValue?: Record<string, any> | null;
    ipAddress?: string;
}

export interface AuditLogFilters {
    actionType?: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    fromDate?: Date;
    toDate?: Date;
    skip?: number;
    take?: number;
}

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
    ) {}

 async createLog(input: CreateAuditLogInput): Promise<AuditLog> {
  const logPayload: DeepPartial<AuditLog> = {
    userId: input.userId ?? 'system',
    actionType: input.actionType,
    entityType: input.entityType,
    entityId: input.entityId,
    oldValue: this.sanitize(input.oldValue),
    newValue: this.sanitize(input.newValue),
    ipAddress: input.ipAddress,
  };

  const log = this.auditLogRepository.create(logPayload);
  return this.auditLogRepository.save(log);
}

async findAll(filters: AuditLogFilters) {
    const where: FindOptionsWhere<AuditLog> = {};

    if (filters.actionType) {
        where.actionType = filters.actionType;
    }

    if (filters.entityType) {
        where.entityType = filters.entityType;
    }

        if (filters.entityId) {
            where.entityId = Like(`%${filters.entityId}%`);
        }

        if (filters.userId) {
            where.userId = filters.userId;
        }

        if (filters.fromDate && filters.toDate) {
            where.createdAt = Between(
                filters.fromDate,
                filters.toDate,
            );
        }

        const [items, totalItems] =
            await this.auditLogRepository.findAndCount({
                where,
                order: {
                    createdAt: 'DESC',
                },
                skip: filters.skip ?? 0,
                take: filters.take ?? 25,
            });

        return {
            items,
            totalItems,
        };
    }

    async findOne(id: number): Promise<AuditLog | null> {
        return this.auditLogRepository.findOne({
            where: { id },
        });
    }

    private sanitize(
        value?: Record<string, any> | null,
    ): Record<string, any> | null {
        if (!value) {
            return null;
        }

        const cloned = JSON.parse(
            JSON.stringify(value),
        );

        const sensitiveFields = [
            'password',
            'token',
            'accessToken',
            'refreshToken',
            'secret',
            'apiKey',
            'creditCard',
        ];

        const walk = (obj: any) => {
            if (!obj || typeof obj !== 'object') {
                return;
            }

            for (const key of Object.keys(obj)) {
                if (
                    sensitiveFields.includes(key)
                ) {
                    obj[key] = '********';
                    continue;
                }

                if (
                    typeof obj[key] === 'object'
                ) {
                    walk(obj[key]);
                }
            }
        };

        walk(cloned);

        return cloned;
    }
}