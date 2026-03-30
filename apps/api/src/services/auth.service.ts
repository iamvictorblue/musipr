import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/errors.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { Role } from '../middleware/auth.js';

function sanitizeUser<T extends { passwordHash: string; refreshTokenVersion: number }>(user: T) {
  const { passwordHash: _passwordHash, refreshTokenVersion: _refreshTokenVersion, ...safeUser } = user;
  return safeUser;
}

export async function signup(input: { email: string; password: string; role?: Role; termsAccepted?: boolean }) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new ApiError(400, 'Email already in use');

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: input.role ?? 'LISTENER',
      termsAcceptedAt: input.termsAccepted ? new Date() : null
    }
  });

  const payload = { sub: user.id, role: user.role, tokenVersion: user.refreshTokenVersion };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload), user: sanitizeUser(user) };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new ApiError(401, 'Invalid credentials');
  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  const payload = { sub: user.id, role: user.role, tokenVersion: user.refreshTokenVersion };
  return { accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload), user: sanitizeUser(user) };
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.refreshTokenVersion !== payload.tokenVersion) throw new ApiError(401, 'Invalid refresh token');
  return {
    accessToken: signAccessToken({ sub: user.id, role: user.role, tokenVersion: user.refreshTokenVersion }),
    refreshToken: signRefreshToken({ sub: user.id, role: user.role, tokenVersion: user.refreshTokenVersion })
  };
}

export async function logout(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { refreshTokenVersion: { increment: 1 } } });
}
