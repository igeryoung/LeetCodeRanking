import app from './app.js';
import { env } from './config/env.js';
import http from 'http';

process.on('unhandledRejection', (reason) => {
  console.error('[process] unhandledRejection', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[process] uncaughtException', error);
});

process.on('beforeExit', (code) => {
  console.warn('[process] beforeExit', code);
});

process.on('exit', (code) => {
  console.warn('[process] exit', code);
});

process.on('SIGTERM', () => {
  console.warn('[process] SIGTERM');
});

process.on('SIGINT', () => {
  console.warn('[process] SIGINT');
});

const server = app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
  console.log('[server] address', server.address());
});

server.on('error', (error) => {
  console.error('[server] error', error);
});

server.on('close', () => {
  console.warn('[server] close');
});

setInterval(() => {
  console.log(`[heartbeat] pid=${process.pid} port=${env.port}`);
}, 30000).unref();

if (env.nodeEnv === 'production') {
  setInterval(() => {
    const req = http.get(`http://127.0.0.1:${env.port}/api/health`, (res) => {
      console.log(`[self-probe] status=${res.statusCode}`);
      res.resume();
    });

    req.on('error', (error) => {
      console.error('[self-probe] error', error);
    });

    req.setTimeout(5000, () => {
      console.error('[self-probe] timeout');
      req.destroy(new Error('self-probe timeout'));
    });
  }, 30000).unref();
}
