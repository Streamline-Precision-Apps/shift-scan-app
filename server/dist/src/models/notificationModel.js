import prisma from "../lib/prisma.js";
export async function createNotification(data) {
    return prisma.notification.create({ data });
}
export async function updateNotificationUrl(id, url) {
    return prisma.notification.update({ where: { id }, data: { url } });
}
export async function findTopicSubscription(userId, topic) {
    return prisma.topicSubscription.findFirst({ where: { userId, topic } });
}
export async function createTopicSubscription(userId, topic) {
    return prisma.topicSubscription.create({ data: { userId, topic } });
}
export async function deleteTopicSubscription(userId, topic) {
    return prisma.topicSubscription.deleteMany({ where: { userId, topic } });
}
//# sourceMappingURL=notificationModel.js.map