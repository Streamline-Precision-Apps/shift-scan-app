import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://6d9be138197f2ce2ada4a4d9b415f513@o4510041612419072.ingest.us.sentry.io/4510245477744640",
  orgId: "4510041616613376",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
