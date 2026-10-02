import express from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { config } from './src/server/config';
import { initDb } from './src/server/db';
import { attachUser } from './src/server/middleware/authMiddleware';
import { authRouter } from './src/server/routes/authRoutes';
import { kieRouter } from './src/server/routes/kieRoutes';
import { musicRouter } from './src/server/routes/musicRoutes';
import { lyricsRouter } from './src/server/routes/lyricsRoutes';
import { adminRouter } from './src/server/routes/adminRoutes';

async function startServer() {
  // 1. Initialize SQLite Database & default accounts
  await initDb();
  console.log('[SUNOMAKER] Database initialized successfully.');

  const app = express();

  // Basic Express middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Attach session user to all requests
  app.use(attachUser);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'SUNOMAKER',
      version: '2.0.0',
      model: 'BYOK (Bring Your Own Kie.ai API Key)',
      timestamp: new Date().toISOString(),
    });
  });

  // API Route Mounts
  app.use('/api/auth', authRouter);
  app.use('/api/kie', kieRouter);
  app.use('/api/music', musicRouter);
  app.use('/api/lyrics', lyricsRouter);
  app.use('/api/admin', adminRouter);

  // Global API 404 handler
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  });

  // Vite middleware in dev or static serving in production
  if (config.isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[SUNOMAKER] Vite middleware mounted in development mode.');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      console.warn('[SUNOMAKER] dist folder not found. Ensure "npm run build" has run for production.');
    }
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[SUNOMAKER Server Error]', err);
    // Never expose stack trace or potential credential leaks to client
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[SUNOMAKER] Music Studio server running at http://0.0.0.0:${config.port}`);
    console.log(`[SUNOMAKER] BYOK Model Active. No global Kie.ai API key is configured.`);
  });
}

startServer().catch((err) => {
  console.error('[SUNOMAKER] Fatal server startup error:', err);
  process.exit(1);
});
