import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { ENV } from './server/src/config/env.js';
import { connectDatabase } from './server/src/config/db.js';
import { seedInitialData } from './server/src/seeds/seedData.js';
import { CartRecoveryService } from './server/src/services/cart-recovery.service.js';
import apiRouter from './server/src/routes/index.js';
import { errorHandler } from './server/src/middleware/errorHandler.middleware.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Global Middlewares
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Initialize resilient database connection and seed initial data safely without wiping existing data
  await connectDatabase();
  await seedInitialData(false);

  // Start 60-minute abandoned cart recovery scheduler
  CartRecoveryService.startWorker();

  // Mount API routes FIRST before SPA/Vite fallback
  app.use('/api', apiRouter);

  // Centralized Error Handling for API routes
  app.use(errorHandler);

  // Vite Middleware for Development or Static Files for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NIVORA Production-Ready Platform live on port ${PORT}`);
  });
}

startServer();
