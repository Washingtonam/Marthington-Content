import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import contentRouter from './src/routes/content.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const requestedPort = Number(process.env.PORT || 5000);
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.use('/api/content', contentRouter);

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined. Please set it in your .env file.');
  process.exit(1);
}

const startServer = (port) => {
  return app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    const server = startServer(requestedPort);

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        const fallbackPort = requestedPort + 1;
        console.warn(`Port ${requestedPort} is busy. Trying ${fallbackPort} instead.`);
        startServer(fallbackPort);
      } else {
        throw error;
      }
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
