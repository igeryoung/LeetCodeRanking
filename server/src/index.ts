import app from './app.js';
import { env } from './config/env.js';

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

const server = app.listen(env.port, '0.0.0.0', () => {
  console.log(`Server running on port ${env.port} (${env.nodeEnv})`);
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
