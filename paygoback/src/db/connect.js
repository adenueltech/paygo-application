const { Sequelize } = require('sequelize');

const connectDB = (databaseUrl) => {
  const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });

  // Test the connection
  sequelize.authenticate()
    .then(() => {
      console.log('✅ PostgreSQL database connected successfully');
    })
    .catch((error) => {
      console.error('❌ Unable to connect to PostgreSQL database:', error);
    });

  return sequelize;
};

module.exports = connectDB;
