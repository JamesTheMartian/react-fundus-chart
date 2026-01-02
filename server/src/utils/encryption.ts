import crypto from 'crypto';

// Get encryption key from environment or use a default (for development only)
// 32 bytes = 64 hex characters
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
const IV_LENGTH = 16; // For AES, this is always 16
const ALGORITHM = 'aes-256-gcm';

if (ENCRYPTION_KEY.length !== 64) {
    console.warn('[SECURITY WARNING] ENCRYPTION_KEY should be 64 hex characters (32 bytes). Using insecure fallback if not matching.');
}

const KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, 'hex');

export function encrypt(text: string): string {
    if (!text) return text;

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY_BUFFER, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(text: string): string {
    if (!text) return text;
    
    // Check if text matches encrypted format (roughly)
    const parts = text.split(':');
    if (parts.length !== 3) {
        // Assume it's legacy plain text (or bad data), return as is or handle accordingly
        // For this implementation, we'll try to return it (might be unencrypted old data)
        return text;
    }

    try {
        const [ivHex, authTagHex, encryptedText] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY_BUFFER, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        return '[Encrypted Data]'; // Fallback to avoid crashing
    }
}
