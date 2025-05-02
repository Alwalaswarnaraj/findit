import dotenv from 'dotenv';
dotenv.config();

export const emailUser = process.env.EMAIL_USER;
export const emailPass = process.env.EMAIL_PASS;
export const frontendUrl = process.env.FRONTEND_URL;
