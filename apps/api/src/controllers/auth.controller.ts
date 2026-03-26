import { Request, Response } from 'express';
import { z } from 'zod';
import { login, logout, refresh, signup } from '../services/auth.service.js';

const signupSchema = z.object({ email: z.string().email(), password: z.string().min(8), role: z.any().optional(), termsAccepted: z.boolean().optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function signupHandler(req: Request, res: Response) {
  const body = signupSchema.parse(req.body);
  const result = await signup(body);
  res.status(201).json(result);
}

export async function loginHandler(req: Request, res: Response) {
  const body = loginSchema.parse(req.body);
  const result = await login(body);
  res.json(result);
}

export async function refreshHandler(req: Request, res: Response) {
  const token = z.string().parse(req.body.refreshToken);
  const result = await refresh(token);
  res.json(result);
}

export async function forgotPasswordHandler(_req: Request, res: Response) {
  res.json({ message: 'Forgot password scaffold. Integrate email provider.' });
}

export async function logoutHandler(req: Request, res: Response) {
  await logout(req.body.userId);
  res.json({ ok: true });
}
