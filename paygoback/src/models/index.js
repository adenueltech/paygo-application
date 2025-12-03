const { Sequelize } = require('sequelize');
const User = require('./Users');
const Notification = require('./Notification');
const Service = require('./Service');
const StreamingSession = require('./StreamingSession');
const { Wallet, Transaction } = require('./wallet');
const Profile = require('./Profile');
const VendorProfile = require('./VendorProfile');
const AdminProfile = require('./AdminProfile');
const Image = require('./Image');
const Consultation = require('./Consultation');
const DashboardStats = require('./DashboardStats');

// Initialize Sequelize instance (will be set by the database connection)
let sequelize;

const initModels = (sequelizeInstance) => {
  sequelize = sequelizeInstance;

  // Initialize all models
  User.init(sequelize);
  Notification.init(sequelize);
  Service.init(sequelize);
  StreamingSession.init(sequelize);
  Wallet.init(sequelize);
  Transaction.init(sequelize);
  Profile.init(sequelize);
  VendorProfile.init(sequelize);
  AdminProfile.init(sequelize);
  Image.init(sequelize);
  Consultation.init(sequelize);
  DashboardStats.init(sequelize);

  // Define associations
  // User has many Notifications
  User.hasMany(Notification, {
    foreignKey: 'userId',
    as: 'notifications',
    onDelete: 'CASCADE'
  });
  Notification.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // User has many Services (as vendor)
  User.hasMany(Service, {
    foreignKey: 'userId',
    as: 'services',
    onDelete: 'CASCADE'
  });
  Service.belongsTo(User, {
    foreignKey: 'userId',
    as: 'vendor'
  });

  // User has one Wallet
  User.hasOne(Wallet, {
    foreignKey: 'userId',
    as: 'wallet',
    onDelete: 'CASCADE'
  });
  Wallet.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // User has one Profile
  User.hasOne(Profile, {
    foreignKey: 'userId',
    as: 'profile',
    onDelete: 'CASCADE'
  });
  Profile.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // User has one VendorProfile
  User.hasOne(VendorProfile, {
    foreignKey: 'userId',
    as: 'vendorProfile',
    onDelete: 'CASCADE'
  });
  VendorProfile.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // User has one AdminProfile
  User.hasOne(AdminProfile, {
    foreignKey: 'userId',
    as: 'adminProfile',
    onDelete: 'CASCADE'
  });
  AdminProfile.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // User has many Images
  User.hasMany(Image, {
    foreignKey: 'userId',
    as: 'images',
    onDelete: 'CASCADE'
  });
  Image.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  // User has many Consultations (as user)
  User.hasMany(Consultation, {
    foreignKey: 'userId',
    as: 'userConsultations',
    onDelete: 'CASCADE'
  });
  // User has many Consultations (as vendor)
  User.hasMany(Consultation, {
    foreignKey: 'vendorId',
    as: 'vendorConsultations',
    onDelete: 'CASCADE'
  });

  Consultation.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });
  Consultation.belongsTo(User, {
    foreignKey: 'vendorId',
    as: 'vendor'
  });
  Consultation.belongsTo(Service, {
    foreignKey: 'serviceId',
    as: 'service'
  });

  // Wallet has many Transactions
  Wallet.hasMany(Transaction, {
    foreignKey: 'walletId',
    as: 'transactions',
    onDelete: 'CASCADE'
  });
  Transaction.belongsTo(Wallet, {
    foreignKey: 'walletId',
    as: 'wallet'
  });

  // StreamingSession associations
  User.hasMany(StreamingSession, {
    foreignKey: 'userId',
    as: 'userSessions',
    onDelete: 'CASCADE'
  });
  User.hasMany(StreamingSession, {
    foreignKey: 'vendorId',
    as: 'vendorSessions',
    onDelete: 'CASCADE'
  });

  StreamingSession.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });
  StreamingSession.belongsTo(User, {
    foreignKey: 'vendorId',
    as: 'vendor'
  });
  StreamingSession.belongsTo(Service, {
    foreignKey: 'serviceId',
    as: 'service'
  });
  StreamingSession.belongsTo(Transaction, {
    foreignKey: 'linkedTransactionId',
    as: 'linkedTransaction'
  });

  Service.hasMany(StreamingSession, {
    foreignKey: 'serviceId',
    as: 'sessions',
    onDelete: 'CASCADE'
  });

  // User has many DashboardStats
  User.hasMany(DashboardStats, {
    foreignKey: 'userId',
    as: 'dashboardStats',
    onDelete: 'CASCADE'
  });
  DashboardStats.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  return {
    User,
    Notification,
    Service,
    StreamingSession,
    Wallet,
    Transaction,
    Profile,
    VendorProfile,
    AdminProfile,
    Image,
    Consultation,
    DashboardStats,
    sequelize
  };
};

module.exports = initModels;