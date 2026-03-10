import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { errorMiddleware } from './middleware/error.middleware';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { trainersRoutes } from './modules/trainers/trainers.routes';
import { classesRoutes } from './modules/classes/classes.routes';
import { bookingsRoutes } from './modules/bookings/bookings.routes';
import { subscriptionsRoutes } from './modules/subscriptions/subscriptions.routes';
import { workoutRoutes } from './modules/workout/workout.routes';
import { chatRoutes } from './modules/chat/chat.routes';
import { notificationsRoutes } from './modules/notifications/notifications.routes';
import { aiRoutes } from './modules/ai/ai.routes';

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth',          authRoutes);
app.use('/api/users',         usersRoutes);
app.use('/api/trainers',      trainersRoutes);
app.use('/api/classes',       classesRoutes);
app.use('/api/bookings',      bookingsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/workout',       workoutRoutes);
app.use('/api/chat',          chatRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/ai',            aiRoutes);

app.use(errorMiddleware);
