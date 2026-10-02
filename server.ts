import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { ENV } from './server/src/config/env.js';
import { connectDatabase } from './server/src/config/db.js';
import { seedInitialData } from './server/src/seeds/seedData.js';
import { CartRecoveryService } from './server/src/services/cart-recovery.service.js';
import { ProductStockCleanupService } from './server/src/services/product-stock-cleanup.service.js';
import { store } from './server/src/db/store.js';
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

  // Helper to dynamically inject OpenGraph / Twitter metadata into HTML for social media crawlers
  const injectProductMeta = (html: string, productIdentifier: string): string => {
    const p = store.products.find(
      (item) => item.slug === productIdentifier || item._id === productIdentifier
    );
    if (!p) return html;

    const priceFormatted = `Rs. ${p.retailPrice.toLocaleString()}`;
    const title = `${p.name} — ${priceFormatted} | MaNHSaaN clothing`;
    const desc =
      p.shortDescription ||
      (p.description ? p.description.slice(0, 160) : '') ||
      `Shop ${p.name} (${p.category} - ${p.fabric || 'Luxury'}). Price: ${priceFormatted} with Cash on Delivery nationwide.`;
    const rawImg = p.images && p.images[0] ? p.images[0] : '';
    const img = rawImg.startsWith('http')
      ? rawImg
      : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&h=630&q=85';
    const cleanSlug = p.slug || p._id;
    const url = `https://manhsaanclothing.com/?product=${encodeURIComponent(cleanSlug)}`;

    let out = html;
    out = out.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
    out = out.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="description" content="${desc.replace(/"/g, '&quot;')}" />`);
    out = out.replace(/<meta\s+property=["']og:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />`);
    out = out.replace(/<meta\s+property=["']og:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />`);
    out = out.replace(/<meta\s+property=["']og:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:image" content="${img}" />`);
    out = out.replace(/<meta\s+property=["']og:url["']\s+content=["'].*?["']\s*\/?>/i, `<meta property="og:url" content="${url}" />`);
    out = out.replace(/<meta\s+name=["']twitter:title["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />`);
    out = out.replace(/<meta\s+name=["']twitter:description["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}" />`);
    out = out.replace(/<meta\s+name=["']twitter:image["']\s+content=["'].*?["']\s*\/?>/i, `<meta name="twitter:image" content="${img}" />`);
    return out;
  };

  // Vite Middleware for Development or Static Files for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Intercept product share URLs in development to inject dynamic OpenGraph tags
    app.use(async (req, res, next) => {
      const productParam = req.query.product ? String(req.query.product) : null;
      if (
        productParam &&
        !req.path.startsWith('/api') &&
        !req.path.startsWith('/@') &&
        !req.path.includes('.')
      ) {
        try {
          const indexPath = path.resolve(process.cwd(), 'index.html');
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(req.originalUrl, template);
          const html = injectProductMeta(template, productParam);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
          return;
        } catch (err) {
          next(err);
          return;
        }
      }
      next();
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
      const productParam = req.query.product ? String(req.query.product) : null;
      const indexPath = path.join(distPath, 'index.html');
      if (productParam && fs.existsSync(indexPath)) {
        const template = fs.readFileSync(indexPath, 'utf-8');
        const html = injectProductMeta(template, productParam);
        res.setHeader('Cache-Control', 'no-cache');
        res.type('text/html').send(html);
        return;
      }
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MaNHSaaN clothing Platform live on port ${PORT}`);
  });
}

startServer();
