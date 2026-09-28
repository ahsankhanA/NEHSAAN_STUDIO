import dotenv from 'dotenv';
dotenv.config({ override: true });

const DEFAULT_VERIFIED_URI = 'mongodb+srv://ahsankhanfdj123_db_user:S3ILdsqGwWGt6xCD@cluster0.vzec4h0.mongodb.net/nehsaan?retryWrites=true&w=majority&appName=Cluster0';

function resolveMongoUri(): string {
  let uri = process.env.MONGODB_URI?.trim();
  if (
    !uri ||
    uri.includes('AS5qhIlnlkD4QPDN') ||
    uri.includes('NEHSAAN7211898') ||
    uri.includes('G5VlBPp3EboY55sC') ||
    uri.includes('<password>')
  ) {
    uri = DEFAULT_VERIFIED_URI;
  }

  // Guarantee database name is explicitly /nehsaan (prevent falling back to default 'test' database)
  if (uri.includes('.mongodb.net/?') || uri.includes('.mongodb.net/test?')) {
    uri = uri.replace('.mongodb.net/?', '.mongodb.net/nehsaan?').replace('.mongodb.net/test?', '.mongodb.net/nehsaan?');
  } else if (uri.endsWith('.mongodb.net/') || uri.endsWith('.mongodb.net')) {
    uri = uri.replace(/\.mongodb\.net\/?$/, '.mongodb.net/nehsaan?retryWrites=true&w=majority&appName=Cluster0');
  }

  return uri;
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  MONGODB_URI: resolveMongoUri(),
  JWT_SECRET: process.env.JWT_SECRET || 'nivora_jwt_secret_dev_super_secure_key_2026',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  INITIAL_SETUP_SECRET: process.env.INITIAL_SETUP_SECRET || 'nivora_super_admin_secure_setup_secret_2026',
  SEED_DEV_DATA: process.env.NODE_ENV !== 'production' && process.env.SEED_DEV_DATA === 'true', // Production starts clean without injecting dummy mock data

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v19.0',
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || '',
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  WHATSAPP_ADMIN_RECIPIENT: process.env.WHATSAPP_ADMIN_RECIPIENT || '+923235277238',
};
