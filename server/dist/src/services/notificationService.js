
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="e851c307-dff6-5ec3-afba-bce4f54c6c57")}catch(e){}}();
import { createNotification, updateNotificationUrl, findTopicSubscription, createTopicSubscription, deleteTopicSubscription, } from "../models/notificationModel.js";
export class NotificationService {
    // Create a notification and update its URL
    static async createAndLinkNotification(data) {
        const notification = await createNotification({
            ...data,
            pushedAt: new Date(),
            pushAttempts: 1,
        });
        // Generate URL with notificationId
        const urlWithId = `${notification.url ? notification.url : "/admins"}${notification.url?.includes("?") ? "&" : "?"}notificationId=${notification.id}`;
        return await updateNotificationUrl(notification.id, urlWithId);
    }
    // Create a notification only
    static async createNotification(data) {
        return await createNotification({
            ...data,
            pushedAt: new Date(),
            pushAttempts: 1,
        });
    }
    // Find topic subscription
    static async findTopicSubscription(userId, topic) {
        return await findTopicSubscription(userId, topic);
    }
    // Create topic subscription
    static async createTopicSubscription(userId, topic) {
        return await createTopicSubscription(userId, topic);
    }
    // Delete topic subscription
    static async deleteTopicSubscription(userId, topic) {
        return await deleteTopicSubscription(userId, topic);
    }
}
export default NotificationService;
//# sourceMappingURL=notificationService.js.map
//# debugId=e851c307-dff6-5ec3-afba-bce4f54c6c57
