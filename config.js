import axios from "axios";

export const PORT = process.env.PORT || 10000;
export const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
export const SUPPORT_MAIL = process.env.SUPPORT_MAIL || "";
export const STRAPI_TOKEN = process.env.STRAPI_TOKEN || "";
export const STRAPI_URL = process.env.STRAPI_URL || "";
export const SENDER_MAIL = process.env.SENDER_MAIL || "";
export const ADMIN_MAIL = process.env.ADMIN_MAIL || "";

const cleanStrapiUrl = STRAPI_URL.replace(/\/+$/, "");
const baseURL = cleanStrapiUrl.endsWith('/api') ? cleanStrapiUrl : `${cleanStrapiUrl}/api`;


export const strapi = axios.create({
    baseURL: STRAPI_URL
})
