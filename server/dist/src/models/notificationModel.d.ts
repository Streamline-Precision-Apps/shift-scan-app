export declare function createNotification(data: any): Promise<{
    topic: string | null;
    title: string;
    body: string | null;
    url: string | null;
    metadata: import("../../generated/prisma/runtime/library.js").JsonValue | null;
    createdAt: Date;
    pushedAt: Date | null;
    pushAttempts: number;
    readAt: Date | null;
    referenceId: string | null;
    id: number;
}>;
export declare function updateNotificationUrl(id: number, url: string): Promise<{
    topic: string | null;
    title: string;
    body: string | null;
    url: string | null;
    metadata: import("../../generated/prisma/runtime/library.js").JsonValue | null;
    createdAt: Date;
    pushedAt: Date | null;
    pushAttempts: number;
    readAt: Date | null;
    referenceId: string | null;
    id: number;
}>;
export declare function findTopicSubscription(userId: string, topic: string): Promise<{
    topic: string;
    createdAt: Date;
    id: string;
    userId: string;
} | null>;
export declare function createTopicSubscription(userId: string, topic: string): Promise<{
    topic: string;
    createdAt: Date;
    id: string;
    userId: string;
}>;
export declare function deleteTopicSubscription(userId: string, topic: string): Promise<import("../../generated/prisma/index.js").Prisma.BatchPayload>;
//# sourceMappingURL=notificationModel.d.ts.map