import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

const RETRY_DELAY_MS = 5000;

const wait = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));

export const connectMongoDB = async () => {
  const connectionString = process.env.DB_CONNECTION_STRING;

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

export const disconnectMongoDB = () => mongoose.disconnect();
