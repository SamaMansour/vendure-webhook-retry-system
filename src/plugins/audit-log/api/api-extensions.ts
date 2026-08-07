import gql from 'graphql-tag';

export const adminApiExtensions = gql`
    type AuditLog implements Node {
        id: ID!
        userId: String!
        actionType: String!
        entityType: String!
        entityId: String!
        oldValue: JSON
        newValue: JSON
        ipAddress: String
        createdAt: DateTime!
        updatedAt: DateTime!
    }

    type AuditLogList implements PaginatedList {
        items: [AuditLog!]!
        totalItems: Int!
    }

    input AuditLogListOptions {
        actionType: String
        entityType: String
        entityId: String
        userId: String
        fromDate: DateTime
        toDate: DateTime
        skip: Int
        take: Int
    }

    extend type Query {
        auditLog(options: AuditLogListOptions): AuditLogList!
    }
`;
