import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // Ensure database name is explicitly appended if missing
    let connectionUri = uri;
    if (connectionUri.endsWith('/')) {
      connectionUri = `${connectionUri}zenithbazaar`;
    }

    const conn = await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
