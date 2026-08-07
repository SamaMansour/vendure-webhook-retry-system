import { Args, Query, Resolver } from '@nestjs/graphql';
import { Allow, Permission } from '@vendure/core';

import { AuditLogFilters, AuditLogService } from '../services/audit-log.service';

type AuditLogListOptions = Omit<AuditLogFilters, 'fromDate' | 'toDate'> & {
    fromDate?: string;
    toDate?: string;
};

@Resolver()
export class AuditLogResolver {
    constructor(private readonly auditLogService: AuditLogService) {}

    @Query()
    @Allow(Permission.SuperAdmin)
    async auditLog(@Args() args: { options?: AuditLogListOptions }) {
        const options = args.options ?? {};

        return this.auditLogService.findAll({
            ...options,
            fromDate: options.fromDate ? new Date(options.fromDate) : undefined,
            toDate: options.toDate ? new Date(options.toDate) : undefined,
        });
    }
}
