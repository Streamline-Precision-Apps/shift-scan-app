
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="321d280a-e2b1-57cf-939b-8ae43e4738d1")}catch(e){}}();
const Sentry = require("@sentry/node");
Sentry.init({
    dsn: "https://6d9be138197f2ce2ada4a4d9b415f513@o4510041612419072.ingest.us.sentry.io/4510245477744640",
    orgId: "4510041616613376",
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
});
export {};
//# sourceMappingURL=instrument.js.map
//# debugId=321d280a-e2b1-57cf-939b-8ae43e4738d1
