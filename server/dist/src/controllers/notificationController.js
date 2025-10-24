
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="1b33ef31-1be4-5cdd-ba21-d074db15fc77")}catch(e){}}();
import { createNotification, updateNotificationUrl, findTopicSubscription, createTopicSubscription, deleteTopicSubscription, } from "../models/notificationModel.js";
import { getFirebaseAdmin } from "../lib/firebase.js";
export async function sendNotificationMulticast(req, res) {
    const admin = getFirebaseAdmin();
    const { topic, title, message, link, referenceId } = req.body;
    if (!topic) {
        return res
            .status(400)
            .json({ error: "Topic is required for sending notifications" });
    }
    if (!title || !message) {
        return res
            .status(400)
            .json({ error: "Title and message body are required" });
    }
    try {
        // Store the notification in the database
        const notification = await createNotification({
            topic,
            title,
            body: message,
            url: link ?? null,
            pushedAt: new Date(),
            pushAttempts: 1,
            referenceId: referenceId?.toString() ?? null,
        });
        const urlWithId = `${notification.url ? notification.url : "/admins"}${notification.url?.includes("?") ? "&" : "?"}notificationId=${notification.id}`;
        const notificationLink = await updateNotificationUrl(notification.id, urlWithId);
        // Create the FCM message payload
        let payload;
        if (notificationLink.url) {
            payload = {
                notification: { title, body: message },
                topic,
                webpush: { fcmOptions: { link: notificationLink.url } },
            };
        }
        else {
            payload = {
                notification: { title, body: message },
                topic,
            };
        }
        // Send the message to Firebase
        const response = await admin.messaging().send(payload);
        return res.status(200).json({
            messageId: response,
            success: true,
            sentToTopic: topic,
        });
    }
    catch (error) {
        console.error("[send-notification] ❌ Error in notification process:", error);
        return res.status(500).json({
            error: "Failed to send notification",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
}
export async function sendNotification(req, res) {
    const admin = getFirebaseAdmin();
    const { token, title, message, link, topic } = req.body;
    if (!token) {
        return res.status(400).json({ error: "Device token is required" });
    }
    let payload;
    if (link) {
        payload = {
            notification: { title, body: message },
            token,
            webpush: { fcmOptions: { link } },
        };
    }
    else {
        payload = {
            notification: { title, body: message },
            token,
        };
    }
    try {
        // Send the FCM notification
        await admin.messaging().send(payload);
        // Save the notification to the database
        await createNotification({
            topic,
            title,
            body: message,
            url: link,
            pushedAt: new Date(),
            pushAttempts: 1,
        });
        return res
            .status(200)
            .json({ success: true, message: "Notification sent!" });
    }
    catch (error) {
        // Still save notification to DB but with failed attempt
        try {
            await createNotification({
                topic,
                title,
                body: message,
                url: link,
                pushAttempts: 1,
            });
        }
        catch (dbError) {
            console.error("Failed to save notification to database:", dbError);
        }
        return res.status(500).json({ success: false, error });
    }
}
export async function topics(req, res) {
    const admin = getFirebaseAdmin();
    const { action, topics, token, userId } = req.body;
    // Validation
    if (!action || !Array.isArray(topics) || !token) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields: action, topics (array), and token are required",
        });
    }
    if (action !== "subscribe" && action !== "unsubscribe") {
        return res.status(400).json({
            success: false,
            error: "Invalid action. Must be 'subscribe' or 'unsubscribe'",
        });
    }
    // Format topics to ensure they start with /topics/
    const formattedTopics = topics.map((topic) => topic.startsWith("/topics/") ? topic : `/topics/${topic}`);
    const results = [];
    const batchSize = 1000;
    for (let i = 0; i < formattedTopics.length; i += batchSize) {
        const batch = formattedTopics.slice(i, i + batchSize);
        for (const topic of batch) {
            let response;
            if (action === "subscribe") {
                response = await admin.messaging().subscribeToTopic(token, topic);
                // Optionally record in DB if userId is provided and successful
                if (response.successCount > 0 && userId) {
                    const topicName = topic.replace("/topics/", "");
                    const existing = await findTopicSubscription(userId, topicName);
                    if (!existing) {
                        await createTopicSubscription(userId, topicName);
                    }
                }
            }
            else {
                response = await admin.messaging().unsubscribeFromTopic(token, topic);
                if (response.successCount > 0 && userId) {
                    const topicName = topic.replace("/topics/", "");
                    await deleteTopicSubscription(userId, topicName);
                }
            }
            results.push({
                topic,
                success: response.successCount > 0,
                failureCount: response.failureCount,
            });
        }
    }
    return res.status(200).json({
        success: true,
        message: `Successfully processed ${action} for ${results.filter((r) => r.success).length} out of ${topics.length} topics`,
        results,
    });
}
//# sourceMappingURL=notificationController.js.map
//# debugId=1b33ef31-1be4-5cdd-ba21-d074db15fc77
