import { DataTable } from '@/vdb/components/data-table/data-table.js';
import { Badge } from '@/vdb/components/ui/badge.js';
import {
    FullWidthPageBlock,
    Page,
    PageLayout,
    PageTitle,
} from '@/vdb/framework/layout-engine/page-layout.js';
import { defineDashboardExtension } from '@/vdb/framework/extension-api/define-dashboard-extension.js';
import { api } from '@/vdb/graphql/api.js';
import { useLocalFormat } from '@/vdb/hooks/use-local-format.js';
import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { Boxes } from 'lucide-react';
import { graphql, ResultOf } from '@/gql';


const auditLogDocument = graphql(`
    query AuditLog {
        auditLog {
            items {
                id
                userId
                actionType
                entityType
                entityId
                oldValue
                newValue
                ipAddress
            }
            totalItems
        }
    }
`);

type AuditLogEntry =
    ResultOf<typeof auditLogDocument>['auditLog']['items'][number];

function AuditLogPage() {
    const { data, refetch } = useQuery({
        queryKey: ['auditLog'],
        queryFn: () => api.query(auditLogDocument),
    });
    const { formatDate } = useLocalFormat();
    const columnHelper = createColumnHelper<AuditLogEntry>();
    const columns = [
        columnHelper.accessor('userId', {
            header: 'User ID',
        }),
        columnHelper.accessor('actionType', {
            header: 'Action Type',
        }),
        columnHelper.accessor('entityType', {
            header: 'Entity Type',
        }),
        columnHelper.accessor('oldValue', {
            header: 'Old Value',
        }),
        columnHelper.accessor('newValue', {
            header: 'New Value',
        }),
        columnHelper.accessor('ipAddress', {
            header: 'IP Address',
        }),
    ];

    return (
        <Page pageId="audit-log">
            <PageTitle>Audit Log</PageTitle>
            <PageLayout>
                <FullWidthPageBlock blockId="list-table">
                    <DataTable
                        onRefresh={refetch}
                        columns={columns}
                        data={data?.auditLog.items ?? []}
                        totalItems={data?.auditLog.totalItems ?? 0}
                    />
                </FullWidthPageBlock>
            </PageLayout>
        </Page>
    );
}

defineDashboardExtension({
    navSections: [
        {
            id: 'AuditLog',
            title: 'Audit Log',
            icon: Boxes,
            order: 300,
        },
    ],
    routes: [
        {
            path: '/audit-log',
            component: () => <AuditLogPage />,
            navMenuItem: {
                sectionId: 'AuditLog',
                id: 'audit-log',
                title: 'Audit Log',
                url: '/audit-log',
            },
        },
    ],
});
