import dotenv from 'dotenv';

dotenv.config();

export const env = {
    appId: process.env.APP_ID,
    appSecret: process.env.APP_SECRET,
    sse: process.env.SSE === 'true',
    port: process.env.PORT,
    debug: process.env.DEBUG === 'true',
}
