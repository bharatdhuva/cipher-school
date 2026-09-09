import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/lld-practice';
  await mongoose.connect(uri);
  console.log(`[DB] Connected to MongoDB: ${uri}`);
}
