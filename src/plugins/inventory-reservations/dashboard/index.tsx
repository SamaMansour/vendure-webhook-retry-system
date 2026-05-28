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


const inventoryReservationsDocument = graphql(`
    query InventoryReservations {
        inventoryReservations {
            items {
                id
                orderCode
                productVariantName
                quantity
                status
                expiresAt
            }
            totalItems
        }
    }
`);

type InventoryReservation =
    ResultOf<typeof inventoryReservationsDocument>['inventoryReservations']['items'][number];

function InventoryReservationsPage() {
    const { data, refetch } = useQuery({
        queryKey: ['inventoryReservations'],
        queryFn: () => api.query(inventoryReservationsDocument),
    });
    const { formatDate } = useLocalFormat();
    const columnHelper = createColumnHelper<InventoryReservation>();
    const columns = [
        columnHelper.accessor('orderCode', {
            header: 'Order',
        }),
        columnHelper.accessor('productVariantName', {
            header: 'Product',
        }),
        columnHelper.accessor('quantity', {
            header: 'Quantity',
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: ({ getValue }) => {
                const status = getValue();
                const variant = status === 'ACTIVE' ? 'success' : status === 'EXPIRED' ? 'destructive' : 'secondary';

                return <Badge variant={variant}>{status}</Badge>;
            },
        }),
        columnHelper.accessor('expiresAt', {
            header: 'Expires At',
            cell: ({ getValue }) =>
                formatDate(getValue(), {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                }),
        }),
    ];

    return (
        <Page pageId="inventory-reservations-list">
            <PageTitle>Inventory Reservations</PageTitle>
            <PageLayout>
                <FullWidthPageBlock blockId="list-table">
                    <DataTable
                        onRefresh={refetch}
                        columns={columns}
                        data={data?.inventoryReservations.items ?? []}
                        totalItems={data?.inventoryReservations.totalItems ?? 0}
                    />
                </FullWidthPageBlock>
            </PageLayout>
        </Page>
    );
}

defineDashboardExtension({
    navSections: [
        {
            id: 'inventory',
            title: 'Inventory',
            icon: Boxes,
            order: 300,
        },
    ],
    routes: [
        {
            path: '/inventory-reservations',
            component: () => <InventoryReservationsPage />,
            navMenuItem: {
                sectionId: 'inventory',
                id: 'inventory-reservations',
                title: 'Reservations',
                url: '/inventory-reservations',
            },
        },
    ],
});
