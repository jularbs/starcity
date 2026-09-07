import mongoose from 'mongoose';
import { config } from '../../config/index.js';

mongoose.set('strictQuery', true);

const RETRY_DELAY_MS = 5000;

const wait = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));

export const connectMongoDB = async () => {
  const connectionString = config.database.mongodb.url;

  if (!connectionString) {
    throw new Error('DB_CONNECTION_STRING is required');
  }

  mongoose.connection.on('disconnected', () => {
    console.error('MongoDB disconnected');
  });
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  while (true) {
    try {
      await mongoose.connect(connectionString, {
        maxPoolSize: 10,
        minPoolSize: 1,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('MongoDB connected');
      return;
    } catch (error) {
      console.error(
        `MongoDB connection failed; retrying in ${RETRY_DELAY_MS / 1000}s:`,
        error.message,
      );
      await wait(RETRY_DELAY_MS);
    }
  }
};

// Drops/creates indexes to match the current schema; fixes stale unique indexes left by removed fields.
export const syncModelIndexes = async (model) => {
  try {
    const dropped = await model.syncIndexes();
    if (dropped.length > 0) {
      console.log(`Synced indexes for ${model.modelName}, dropped:`, dropped);
    }
  } catch (error) {
    console.error(
      `Failed to sync indexes for ${model.modelName}:`,
      error.message,
    );
  }
};

export const disconnectMongoDB = () => mongoose.disconnect();
