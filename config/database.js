import mongoose from 'mongoose';

// Optimized MongoDB connection for cross-region performance
export const connectDB = async () => {
  try {
    const options = {
      // Connection pool settings for better performance
      maxPoolSize: 10, // Maximum number of connections
      minPoolSize: 2,  // Minimum number of connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long to wait for a response
      
      // Buffering settings
      // bufferMaxEntries: 0, // Disable mongoose buffering
      // bufferCommands: false, // Disable mongoose buffering
      
      // Write concern for better performance
      writeConcern: {
        w: 'majority',
        j: true, // Wait for journal
        wtimeout: 5000 // Timeout after 5 seconds
      },
      
      // Read preference for better performance across regions
      readPreference: 'primaryPreferred', // Read from primary, fallback to secondary
      
      // Compression for network efficiency
      compressors: ['zlib'],
      zlibCompressionLevel: 6,
      
      // Connection retry settings
      retryWrites: true,
      retryReads: true,
      
      // Heartbeat settings for connection monitoring
      heartbeatFrequencyMS: 10000, // Check connection every 10 seconds
      
      // Additional performance settings
      directConnection: false, // Use connection string routing
      appName: 'CarWashApp-Production' // For MongoDB monitoring
    };

    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb+srv://ziadadel6060:Honda999@cluster0.ysigfwu.mongodb.net/italy?retryWrites=true&w=majority",
      options
    );
    
    console.log("MongoDB connected successfully with optimized settings");
    console.log(`Connection pool size: ${options.maxPoolSize}`);
    console.log(`Read preference: ${options.readPreference}`);
    
    // Monitor connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// Graceful shutdown
export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDB();
  process.exit(0);
});

