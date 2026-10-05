import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import { corsOptions } from './config/cors.js';
import { swaggerDocument } from './docs/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { networkAccessSecurity, checkNetworkAccess } from './middleware/networkAccess.js';
import { NotFoundError } from './errors/AppError.js';
import { env } from './config/env.js';
import apiV1Router from './routes/index.js';
import healthRoutes from './routes/health.routes.js';

export const createApp = (): Express => {
  const app = express();

  // Paths to public static assets and compiled frontend build
  const backendPublicPath = path.resolve(process.cwd(), 'public');
  const frontendPublicPath = path.resolve(process.cwd(), '../frontend/public');
  const frontendDistPath = path.resolve(process.cwd(), '../frontend/dist');

  // Serve static files from backend public (and frontend dist if present)
  app.use(express.static(backendPublicPath));
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
  }
  app.use('/images', express.static(path.join(backendPublicPath, 'images')));
  if (fs.existsSync(frontendPublicPath)) {
    app.use('/images', express.static(path.join(frontendPublicPath, 'images')));
  }
  app.use('/logo.png', express.static(path.join(backendPublicPath, 'logo.png')));
  app.use('/logo.jpg', express.static(path.join(backendPublicPath, 'logo.jpg')));

  // Trust proxy for rate limiters behind load balancers/reverse proxies
  app.set('trust proxy', 1);

  // Network access security and controls
  app.use(checkNetworkAccess);
  app.use(networkAccessSecurity);

  // Security Headers (Section 66)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://images.unsplash.com'],
          connectSrc: [
            "'self'",
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'https://*.railway.app',
            'https://*.up.railway.app',
            'https://staging.mwanchasenior.org',
            'https://mwanchasenior.org'
          ]
        }
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Allow network access in development
      ...(env.NODE_ENV === 'development' && {
        contentSecurityPolicy: false
      })
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

  // Serve Single Page Application (SPA) or API directory for non-API routes
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    // If request is targeting an API route that wasn't found, pass to 404 handler
    if (req.path.startsWith('/api')) {
      return next(new NotFoundError(`API endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`));
    }

    // Try backend public/index.html first, then ../frontend/dist/index.html
    const localIndex = path.join(backendPublicPath, 'index.html');
    if (fs.existsSync(localIndex)) {
      return res.sendFile(localIndex);
    }

    const frontendIndex = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(frontendIndex)) {
      return res.sendFile(frontendIndex);
    }

    // Fallback if no frontend build is present: return clean API status info
    return res.status(200).json({
      name: 'Mwancha Senior Community (MSC) API',
      status: 'active',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/health',
      endpoints: '/api/v1'
    });
  });

  // 404 handler for undefined API endpoints (POST, PUT, DELETE, or unhandled /api/*)
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError(`API endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`));
  });

  // Centralized Error Handling Middleware (Section 48)
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
