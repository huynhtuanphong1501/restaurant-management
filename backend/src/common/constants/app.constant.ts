import "dotenv/config";

export const PORT = process.env.PORT;
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

console.log({
    PORT: PORT,
    DATABASE_URL: DATABASE_URL,
    JWT_SECRET_KEY: JWT_SECRET_KEY,
    JWT_REFRESH_SECRET: JWT_REFRESH_SECRET
})