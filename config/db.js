const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = `${process.env.MONGODB_URI}${process.env.DB_NAME}`;
    
    console.log("Connecting to MongoDB:", mongoURI); // Debugging log

    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
