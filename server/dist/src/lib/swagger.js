
!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="19ca7bed-d01e-50f3-ba4f-f7031691cf67")}catch(e){}}();
import swaggerJsdoc from "swagger-jsdoc";
import config from "./config.js";
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Shift Scan API",
            version: "1.0.0",
            description: "API documentation for Shift Scan application",
            contact: {
                name: "API Support",
                email: "support@example.com",
            },
        },
        servers: [
            {
                url: `http://localhost:${config.port}`,
                description: "Development server",
            },
            {
                url: `${process.env.PRODUCTION_URL || "https://api.example.com"}`,
                description: "Production server",
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                },
            },
        },
        security: [{ BearerAuth: [] }],
    },
    apis: ["./src/routes/*.ts"],
};
export const swaggerSpec = swaggerJsdoc(options);
//# sourceMappingURL=swagger.js.map
//# debugId=19ca7bed-d01e-50f3-ba4f-f7031691cf67
