const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

async function migrateZcashFields() {
  try {
    console.log('🔄 Starting Zcash fields migration...');

    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name IN (
        'zcashAddress',
        'zcashEncryptedPrivateKey',
        'viewingKey',
        'zcashAccountIndex',
        'isSynced',
        'lastSyncHeight'
      );
    `);

    const existingColumns = results.map(row => row.column_name);
    console.log('📋 Existing Zcash columns:', existingColumns);

    // Add missing columns
    const columnsToAdd = [
      {
        name: 'zcashAddress',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS "zcashAddress" VARCHAR(95) UNIQUE;`
      },
      {
        name: 'zcashEncryptedPrivateKey',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS "zcashEncryptedPrivateKey" TEXT;`
      },
      {
        name: 'viewingKey',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS "viewingKey" TEXT;`
      },
      {
        name: 'zcashAccountIndex',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS "zcashAccountIndex" INTEGER DEFAULT 0;`
      },
      {
        name: 'isSynced',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS "isSynced" BOOLEAN DEFAULT false;`
      },
      {
        name: 'lastSyncHeight',
        sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastSyncHeight" INTEGER DEFAULT 0;`
      }
    ];

    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`➕ Adding column: ${column.name}`);
        await sequelize.query(column.sql);
        console.log(`✅ Added column: ${column.name}`);
      } else {
        console.log(`⏭️ Column already exists: ${column.name}`);
      }
    }

    console.log('✅ Zcash fields migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateZcashFields();