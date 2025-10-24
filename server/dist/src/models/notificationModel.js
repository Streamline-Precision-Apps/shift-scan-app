
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1a7b9b8d-c1d8-5a3b-80ce-e7eb49312eaa")}catch(e){}}();
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
//# debugId=1a7b9b8d-c1d8-5a3b-80ce-e7eb49312eaa
