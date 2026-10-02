import express from 'express';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { ENV } from './server/src/config/env.js';
import { connectDatabase } from './server/src/config/db.js';
import { seedInitialData } from './server/src/seeds/seedData.js';
import { CartRecoveryService } from './server/src/services/cart-recovery.service.js';
import { ProductStockCleanupService } from './server/src/services/product-stock-cleanup.service.js';
import apiRouter from './server/src/routes/index.js';
import { errorHandler } from './server/src/middleware/errorHandler.middleware.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Global Middlewares (High performance gzip/deflate compression)
  app.use(compression({
    level: 6,
    threshold: 1024,
  }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // SEO Endpoints: robots.txt and dynamic sitemap.xml
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Sitemap: https://manhsaanclothing.com/sitemap.xml
`);
  });

  app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    const now = new Date().toISOString().slice(0, 10);
    const categories = ['lawn', 'chiffon', 'organza', 'boski', 'jacquard', 'summer', 'winter', 'festive-wear'];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://manhsaanclothing.com/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${categories.map((c) => `  <url>
    <loc>https://manhsaanclothing.com/?category=${c}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
    res.send(xml);
  });

  // Connect to MongoDB Atlas (cloud database is the single source of truth) and verify Super Admin account
  await connectDatabase();
  await seedInitialData(false);

  // Start 60-minute abandoned cart recovery scheduler
  CartRecoveryService.startWorker();

  // Start 3-day out-of-stock automatic cleanup worker
  ProductStockCleanupService.startWorker();

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
    // Long-term immutable caching for hashed production assets
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
    }));
    app.use(express.static(distPath, {
      maxAge: '1h',
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MaNHSaaN clothing Platform live on port ${PORT}`);
  });
}

startServer();
