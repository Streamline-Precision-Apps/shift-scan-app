import {
  createNotification,
  updateNotificationUrl,
  findTopicSubscription,
  createTopicSubscription,
  deleteTopicSubscription,
} from "../models/notificationModel.js";

export class NotificationService {
  // Create a notification and update its URL
  static async createAndLinkNotification(data: any): Promise<any> {
    const notification = await createNotification({
      ...data,
      pushedAt: new Date(),
      pushAttempts: 1,
    });
    // Generate URL with notificationId
    const urlWithId = `${notification.url ? notification.url : "/admins"}${
      notification.url?.includes("?") ? "&" : "?"
    }notificationId=${notification.id}`;
    return await updateNotificationUrl(notification.id, urlWithId);
  }

  // Create a notification only
  static async createNotification(data: any): Promise<any> {
    return await createNotification({
      ...data,
      pushedAt: new Date(),
      pushAttempts: 1,
    });
  }

  // Find topic subscription
  static async findTopicSubscription(userId: string, topic: string) {
    return await findTopicSubscription(userId, topic);
  }

  // Create topic subscription
  static async createTopicSubscription(userId: string, topic: string) {
    return await createTopicSubscription(userId, topic);
  }

  // Delete topic subscription
  static async deleteTopicSubscription(userId: string, topic: string) {
    return await deleteTopicSubscription(userId, topic);
  }
}

export default NotificationService;
