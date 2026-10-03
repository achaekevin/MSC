import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { corsOptions } from './config/cors.js';
import { swaggerDocument } from './docs/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { NotFoundError } from './errors/AppError.js';
import apiV1Router from './routes/index.js';
import healthRoutes from './routes/health.routes.js';

export const createApp = (): Express => {
  const app = express();

  // Trust proxy for rate limiters behind load balancers/reverse proxies
  app.set('trust proxy', 1);

  // Security Headers (Section 66)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://images.unsplash.com'],
          connectSrc: ["'self'", 'http://localhost:5173', 'https://staging.mwanchasenior.org', 'https://mwanchasenior.org']
        }
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // CORS (Section 39)
  app.use(cors(corsOptions));

  // Rate Limiting (Section 38)
  app.use(generalLimiter);

  // Body Parsing with size limits (Section 37)
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Swagger/OpenAPI Documentation (Section 51)
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Health and Readiness Checks (Section 50)
  app.use('/', healthRoutes);

  // Mount API v1 (Section 4 & 67)
  app.use('/api/v1', apiV1Router);

  // 404 handler for undefined endpoints
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError(`API endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`));
  });

  // Centralized Error Handling Middleware (Section 48)
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
