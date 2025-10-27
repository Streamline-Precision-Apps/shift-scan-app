export declare class NotificationService {
    static createAndLinkNotification(data: any): Promise<any>;
    static createNotification(data: any): Promise<any>;
    static findTopicSubscription(userId: string, topic: string): Promise<{
        topic: string;
        createdAt: Date;
        id: string;
        userId: string;
    } | null>;
    static createTopicSubscription(userId: string, topic: string): Promise<{
        topic: string;
        createdAt: Date;
        id: string;
        userId: string;
    }>;
    static deleteTopicSubscription(userId: string, topic: string): Promise<import("../../generated/prisma/index.js").Prisma.BatchPayload>;
}
export default NotificationService;
//# sourceMappingURL=notificationService.d.ts.map