// controllers/userDashboardController.js
const StreamingSession = require('../models/StreamingSession');
const Service = require('../models/Service');
const DashboardStats = require('../models/DashboardStats');

// 📊 Get User Dashboard Overview
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = 'monthly' } = req.query; // daily, weekly, monthly, yearly

    // Get session history
    const sessions = await StreamingSession.find({ userId })
      .populate('serviceId', 'name category rate unit')
      .populate('vendorId', 'name businessName')
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate stats
    const totalSessions = sessions.length;
    const totalSpent = sessions.reduce((sum, session) => sum + session.totalCost, 0);
    const averageSessionLength = sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + session.totalUsageSeconds, 0) / sessions.length 
      : 0;

    // Get favorite categories
    const categoryStats = sessions.reduce((acc, session) => {
      const category = session.serviceId?.category || 'Unknown';
      if (!acc[category]) {
        acc[category] = { sessionCount: 0, totalSpent: 0 };
      }
      acc[category].sessionCount++;
      acc[category].totalSpent += session.totalCost;
      return acc;
    }, {});

    const favoriteCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        sessionCount: stats.sessionCount,
        totalSpent: stats.totalSpent
      }))
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, 5);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSessions = sessions.filter(session => 
      new Date(session.createdAt) >= sevenDaysAgo
    );

    res.status(200).json({
      overview: {
        totalSessions,
        totalSpent: Math.round(totalSpent * 100) / 100,
        averageSessionLength: Math.round(averageSessionLength),
        recentActivity: recentSessions.length
      },
      favoriteCategories,
      recentSessions: sessions.slice(0, 10), // Last 10 sessions
      analytics: await getUserAnalytics(userId, period)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📈 Get User Session History
exports.getUserSessionHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, status } = req.query;

    const filter = { userId };
    if (status) filter.status = status;

    const sessions = await StreamingSession.find(filter)
      .populate('serviceId', 'name category rate unit')
      .populate('vendorId', 'name businessName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await StreamingSession.countDocuments(filter);

    res.status(200).json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalSessions: total
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Get Single Session Details
exports.getSessionDetails = async (req, res) => {
  try {
    const session = await StreamingSession.findOne({
      sessionId: req.params.sessionId,
      userId: req.user.userId
    })
    .populate('serviceId')
    .populate('vendorId', 'name businessName email');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function for analytics
const getUserAnalytics = async (userId, period) => {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'daily':
      startDate.setDate(now.getDate() - 30); // Last 30 days
      break;
    case 'weekly':
      startDate.setDate(now.getDate() - 90); // Last 90 days
      break;
    case 'monthly':
      startDate.setFullYear(now.getFullYear() - 1); // Last 12 months
      break;
    case 'yearly':
      startDate.setFullYear(now.getFullYear() - 3); // Last 3 years
      break;
  }

  const sessions = await StreamingSession.find({
    userId,
    createdAt: { $gte: startDate }
  });

  // Group by time period
  const analytics = sessions.reduce((acc, session) => {
    let key;
    const sessionDate = new Date(session.createdAt);
    
    switch (period) {
      case 'daily':
        key = sessionDate.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'weekly':
        key = `Week ${Math.ceil(sessionDate.getDate() / 7)}-${sessionDate.getMonth() + 1}`;
        break;
      case 'monthly':
        key = sessionDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        break;
      case 'yearly':
        key = sessionDate.getFullYear().toString();
        break;
    }

    if (!acc[key]) {
      acc[key] = { sessionCount: 0, totalSpent: 0 };
    }
    
    acc[key].sessionCount++;
    acc[key].totalSpent += session.totalCost;
    
    return acc;
  }, {});

  return Object.entries(analytics).map(([period, data]) => ({
    period,
    sessionCount: data.sessionCount,
    totalSpent: Math.round(data.totalSpent * 100) / 100
  }));
};