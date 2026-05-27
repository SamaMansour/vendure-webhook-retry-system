import gql from 'graphql-tag';

export const adminApiExtensions = gql`
    enum InventoryReservationStatus {
        ACTIVE
        EXPIRED
        COMPLETED
    }

    type InventoryReservation implements Node {
        id: ID!
        orderId: ID!
        orderCode: String!
        productVariantId: Int!
        productVariantName: String!
        quantity: Int!
        status: InventoryReservationStatus!
        expiresAt: DateTime!
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    type InventoryReservationList implements PaginatedList {
        items: [InventoryReservation!]!
        totalItems: Int!
    }

    input InventoryReservationListOptions

    extend type Query {
        inventoryReservations(
            options: InventoryReservationListOptions
            status: InventoryReservationStatus
        ): InventoryReservationList!
    }
`;
