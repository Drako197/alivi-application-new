// Main entry point for the Simple Memory Server
import { SimpleMemoryServer } from './server.js';

const server = new SimpleMemoryServer(3001);

// Start the server
server.start().catch((error) => {
  console.error('Failed to start Simple Memory Server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down Simple Memory Server...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down Simple Memory Server...');
  await server.stop();
  process.exit(0);
});

