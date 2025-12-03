// removeIndex.js
const mongoose = require('mongoose');
require('dotenv').config();

async function removeProblematicIndex() {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log('Connected to MongoDB');
    
    await mongoose.connection.db.collection('profiles').dropIndex(" userId_1");
    console.log("✅ Successfully dropped wallet.address_1 index");
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    if (error.codeName === 'IndexNotFound') {
      console.log("ℹ️  wallet.address_1 index already removed");
    } else {
      console.log("❌ Error:", error.message);
    }
    await mongoose.disconnect();
  }
}

removeProblematicIndex();