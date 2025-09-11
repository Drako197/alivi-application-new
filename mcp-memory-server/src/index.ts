// Main entry point for the Alivi MCP Memory Server
import { AliviMemoryServer } from './server.js';

const server = new AliviMemoryServer();

// Start the server
server.start().catch((error) => {
  console.error('Failed to start Alivi Memory Server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.error('Shutting down Alivi Memory Server...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Shutting down Alivi Memory Server...');
  await server.stop();
  process.exit(0);
});

