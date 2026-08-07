import { Injectable } from '@nestjs/common';
import { TransactionalConnection } from '@vendure/core';
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
    constructor(private readonly connection: TransactionalConnection) {}

 async createLog(input: CreateAuditLogInput): Promise<AuditLog> {
  const auditLogRepository = this.connection.rawConnection.getRepository(AuditLog);
  const logPayload = {
    userId: input.userId ?? 'system',
    actionType: input.actionType,
    entityType: input.entityType,
    entityId: input.entityId,
    oldValue: this.sanitize(input.oldValue),
    newValue: this.sanitize(input.newValue),
    ipAddress: input.ipAddress,
  };

  const log = auditLogRepository.create(logPayload);
  return auditLogRepository.save(log);
}

async findAll(filters: AuditLogFilters) {
    const auditLogRepository = this.connection.rawConnection.getRepository(AuditLog);
    const queryBuilder = auditLogRepository.createQueryBuilder('auditLog');

    if (filters.actionType) {
        queryBuilder.andWhere('auditLog.actionType = :actionType', {
            actionType: filters.actionType,
        });
    }

    if (filters.entityType) {
        queryBuilder.andWhere('auditLog.entityType = :entityType', {
            entityType: filters.entityType,
        });
    }

        if (filters.entityId) {
            queryBuilder.andWhere('auditLog.entityId LIKE :entityId', {
                entityId: `%${filters.entityId}%`,
            });
        }

        if (filters.userId) {
            queryBuilder.andWhere('auditLog.userId = :userId', {
                userId: filters.userId,
            });
        }

        if (filters.fromDate && filters.toDate) {
            queryBuilder.andWhere('auditLog.createdAt BETWEEN :fromDate AND :toDate', {
                fromDate: filters.fromDate,
                toDate: filters.toDate,
            });
        }

        const [items, totalItems] =
            await queryBuilder
                .orderBy('auditLog.createdAt', 'DESC')
                .skip(filters.skip ?? 0)
                .take(filters.take ?? 25)
                .getManyAndCount();

        return {
            items,
            totalItems,
        };
    }

    async findOne(id: number): Promise<AuditLog | null> {
        return this.connection.rawConnection.getRepository(AuditLog).findOne({
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
