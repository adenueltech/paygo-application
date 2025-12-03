// removeUserIdIndex.js
const mongoose = require('mongoose');
require('dotenv').config();

async function removeUserIdIndex() {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log('Connected to MongoDB');
    
    // Drop the userId_1 index
    await mongoose.connection.db.collection('services').dropIndex("userId_1");
    console.log("✅ Successfully dropped userId_1 index");
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    if (error.codeName === 'IndexNotFound') {
      console.log("ℹ️ userId_1 index already removed");
    } else {
      console.log("❌ Error:", error.message);
    }
    await mongoose.disconnect();
  }
}

removeUserIdIndex();