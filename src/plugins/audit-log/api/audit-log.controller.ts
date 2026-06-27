import {
    BadRequestException,
    Controller,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
    Query,
} from '@nestjs/common';

import { AuditLogFilters, AuditLogService } from '../services/audit-log.service';

type AuditLogQuery = {
    actionType?: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    fromDate?: string;
    toDate?: string;
    skip?: string;
    take?: string;
};

@Controller('audit-logs')
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}

    @Get()
    async findAll(@Query() query: AuditLogQuery) {
        return this.auditLogService.findAll(this.toFilters(query));
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const auditLog = await this.auditLogService.findOne(id);

        if (!auditLog) {
            throw new NotFoundException(`Audit log ${id} was not found`);
        }

        return auditLog;
    }

    private toFilters(query: AuditLogQuery): AuditLogFilters {
        return {
            actionType: query.actionType,
            entityType: query.entityType,
            entityId: query.entityId,
            userId: query.userId,
            fromDate: this.parseDate(query.fromDate, 'fromDate'),
            toDate: this.parseDate(query.toDate, 'toDate'),
            skip: this.parseNumber(query.skip, 'skip'),
            take: this.parseNumber(query.take, 'take'),
        };
    }

    private parseDate(value: string | undefined, name: string): Date | undefined {
        if (!value) {
            return undefined;
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            throw new BadRequestException(`${name} must be a valid date`);
        }

        return date;
    }

    private parseNumber(value: string | undefined, name: string): number | undefined {
        if (!value) {
            return undefined;
        }

        const number = Number(value);

        if (!Number.isInteger(number) || number < 0) {
            throw new BadRequestException(`${name} must be a positive integer`);
        }

        return number;
    }
}
