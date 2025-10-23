import prisma from "../lib/prisma.js";

export async function createNotification(data: any) {
  return prisma.notification.create({ data });
}

export async function updateNotificationUrl(id: number, url: string) {
  return prisma.notification.update({ where: { id }, data: { url } });
}

export async function findTopicSubscription(userId: string, topic: string) {
  return prisma.topicSubscription.findFirst({ where: { userId, topic } });
}

export async function createTopicSubscription(userId: string, topic: string) {
  return prisma.topicSubscription.create({ data: { userId, topic } });
}

export async function deleteTopicSubscription(userId: string, topic: string) {
  return prisma.topicSubscription.deleteMany({ where: { userId, topic } });
}
