import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

export const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api', routes);
app.use(errorHandler);
