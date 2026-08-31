import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { createToken } from './token.util';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

@Injectable()
export class AuthService {
  login(password: string): string | null {
    const adminPassword = process.env.ADMIN_PASSWORD ?? '';
    const secret = process.env.JWT_SECRET ?? '';

    if (!password || !adminPassword || !secret) return null;
    if (!passwordsMatch(password, adminPassword)) return null;

    return createToken(secret, TOKEN_TTL_SECONDS);
  }
}

function passwordsMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}
