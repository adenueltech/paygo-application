// cleanupNullUsers.js
const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupNullUsers() {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log('Connected to MongoDB');
    
    // Delete all services with null userId
    const result = await mongoose.connection.db.collection('services').deleteMany({ userId: null });
    console.log(`✅ Deleted ${result.deletedCount} services with null userId`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.log("❌ Error:", error.message);
    await mongoose.disconnect();
  }
}

cleanupNullUsers();