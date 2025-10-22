import prisma from './lib/prisma.js';
async function main() {
    console.log('🚀 Server starting...');
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');
        // You can add your server logic here
        // For example, using Express.js:
        // const express = require('express')
        // const app = express()
        // const port = process.env.PORT || 3001
        console.log('🌟 Server is ready!');
    }
    catch (error) {
        console.error('❌ Failed to connect to database:', error);
        process.exit(1);
    }
}
// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🔄 Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});
main().catch(async (error) => {
    console.error('💥 Server crashed:', error);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=index.js.map