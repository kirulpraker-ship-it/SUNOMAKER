import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Ensure an encryption key exists
let encryptionKey = process.env.KIE_CREDENTIAL_ENCRYPTION_KEY;
if (!encryptionKey || encryptionKey.length < 32) {
  // Generate a deterministic or fallback key for development if not provided
  encryptionKey = 'sunomaker-default-secure-encryption-key-32-bytes-long!';
}

export const config = {
  port: 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  dbUrl: process.env.DATABASE_URL || 'file:./data/sunomaker.db',
  sessionSecret: process.env.SESSION_SECRET || 'sunomaker-secure-session-secret-key-32chars',
  credentialEncryptionKey: encryptionKey,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  callbackUrl: process.env.CALLBACK_URL || 'http://localhost:3000/api/kie/callback',
  mockKieApi: process.env.MOCK_KIE_API === 'true',
  dataDir: path.resolve(process.cwd(), 'data'),
};
