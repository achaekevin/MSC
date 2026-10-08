import crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export const generateTotpSecret = (length = 20): string => {
  const randomBytes = crypto.randomBytes(length);
  let secret = '';
  for (let i = 0; i < randomBytes.length; i++) {
    secret += BASE32_ALPHABET[randomBytes[i] % BASE32_ALPHABET.length];
  }
  return secret;
};

const base32Decode = (base32: string): Buffer => {
  let bits = '';
  const cleanBase32 = base32.toUpperCase().replace(/[\s-]/g, '');
  for (const char of cleanBase32) {
    const val = BASE32_ALPHABET.indexOf(char);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  return Buffer.from(bytes);
};

export const generateTotpCode = (secret: string, counter = Math.floor(Date.now() / 1000 / 30)): string => {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, '0');
};

export const verifyTotpCode = (code: string, secret: string, window = 1): boolean => {
  const cleanCode = code.trim().replace(/\s+/g, '');
  if (!/^\d{6}$/.test(cleanCode)) return false;

  const currentStep = Math.floor(Date.now() / 1000 / 30);
  for (let i = -window; i <= window; i++) {
    if (generateTotpCode(secret, currentStep + i) === cleanCode) {
      return true;
    }
  }
  return false;
};

export const getTotpAuthUri = (email: string, secret: string, issuer = 'Mwancha Senior Community'): string => {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedEmail = encodeURIComponent(email);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
};

export interface BackupCode {
  plain: string;
  hash: string;
}

export const generateBackupCodes = (count = 8): { plainCodes: string[]; hashedCodes: { hash: string; used: boolean }[] } => {
  const plainCodes: string[] = [];
  const hashedCodes: { hash: string; used: boolean }[] = [];

  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 characters
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
    const hash = crypto.createHash('sha256').update(formatted.replace(/-/g, '')).digest('hex');

    plainCodes.push(formatted);
    hashedCodes.push({ hash, used: false });
  }

  return { plainCodes, hashedCodes };
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
};
