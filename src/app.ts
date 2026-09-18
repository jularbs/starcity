import 'dotenv/config';
import { config } from './config/index.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import { catchAllLimiter } from './common/middleware/rate-limit.middleware.js';
import rideCategoryRoutes from './modules/rideCategory/rideCategory.routes.js';
import rideRoutes from './modules/ride/ride.routes.js';
import ticketRoutes from './modules/ticket/ticket.routes.js';
import paymentOptionRoutes from './modules/paymentOption/paymentOption.routes.js';
import optionRoutes from './modules/option/option.routes.js';
import saleRoutes from './modules/sale/sale.routes.js';
import accessPassRoutes from './modules/accessPass/accessPass.routes.js';
import postRoutes from './modules/post/post.routes.js';
import imageSliderRoutes from './modules/imageSlider/imageSlider.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import mediaRoutes from './modules/media/media.routes.js';
import webhookRoutes from './modules/webhooks/webhooks.routes.js';
import promoRoutes from './modules/promo/promo.routes.js';
import userRoutes from './modules/user/user.routes.js';
import auditTrailRoutes from './modules/auditTrail/auditTrail.routes.js';

import { errorHandler } from './common/middleware/error-handler.middleware.js';
import { notFoundHandler } from './common/middleware/not-found.handler.js';
import { sanitizeRequestForMongoDB } from './common/middleware/mongo-sanitize.mniddleware.js';
const app = express();
const allowedDomains = config.cors.origin;

app.set('trust proxy', 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedDomains.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`This site ${origin} does not have access.`),
        false,
      );
    },
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin'],
  }),
);

app.use(helmet());
app.disable('x-powered-by');

app.use(morgan(config.app.isDevelopment ? 'dev' : 'combined'));
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(sanitizeRequestForMongoDB);

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /\n');
});

app.use('/api', rideCategoryRoutes);
app.use('/api', rideRoutes);
app.use('/api', ticketRoutes);
app.use('/api', paymentOptionRoutes);
app.use('/api', optionRoutes);
app.use('/api', saleRoutes);
app.use('/api', accessPassRoutes);
app.use('/api', postRoutes);
app.use('/api', imageSliderRoutes);
app.use('/api', authRoutes);
app.use('/api', mediaRoutes);
app.use('/api', promoRoutes);
app.use('/api', userRoutes);
app.use('/api', auditTrailRoutes);
app.use('/webhooks', webhookRoutes);

app.use(catchAllLimiter());
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
