// controllers/vendorDashboardController.js
const StreamingSession = require('../models/StreamingSession');
const Service = require('../models/Service');
const User = require('../models/Users');

// 💰 Get Vendor Dashboard Overview
exports.getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const { period = 'monthly' } = req.query;

    // Verify user is vendor
    const user = await User.findById(vendorId);
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    // Get vendor's services
    const services = await Service.find({ userId: vendorId });
    
    // Get sessions for vendor's services
    const sessions = await StreamingSession.find({ vendorId })
      .populate('userId', 'name email')
      .populate('serviceId', 'name category')
      .sort({ createdAt: -1 });

    // Calculate earnings stats
    const totalEarnings = sessions.reduce((sum, session) => sum + session.totalCost, 0);
    const totalSessionsHosted = sessions.length;
    const activeServices = services.filter(service => service.isActive).length;

    // Top performing services
    const servicePerformance = services.map(service => {
      const serviceSessions = sessions.filter(session => 
        session.serviceId?._id.toString() === service._id.toString()
      );
      
      return {
        serviceId: service._id,
        serviceName: service.name,
        sessionCount: serviceSessions.length,
        totalEarnings: serviceSessions.reduce((sum, session) => sum + session.totalCost, 0),
        isActive: service.isActive
      };
    }).sort((a, b) => b.totalEarnings - a.totalEarnings);

    const topServices = servicePerformance.slice(0, 5);

    // Recent customers
    const recentCustomers = [...new Set(sessions.slice(0, 10).map(session => session.userId))];

    res.status(200).json({
      overview: {
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        totalSessionsHosted,
        activeServices,
        totalServices: services.length,
        averageEarningPerSession: totalSessionsHosted > 0 ? totalEarnings / totalSessionsHosted : 0
      },
      topServices,
      recentSessions: sessions.slice(0, 10),
      recentCustomers,
      services: servicePerformance,
      analytics: await getVendorAnalytics(vendorId, period)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📈 Get Vendor Earnings Report
exports.getVendorEarningsReport = async (req, res) => {
  try {
    const vendorId = req.user.userId;
    const { startDate, endDate, groupBy = 'daily' } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await StreamingSession.find({
      vendorId,
      status: 'completed',
      ...dateFilter
    }).populate('serviceId', 'name');

    // Group earnings by time period
    const earningsReport = sessions.reduce((acc, session) => {
      const sessionDate = new Date(session.createdAt);
      let periodKey;

      switch (groupBy) {
        case 'daily':
          periodKey = sessionDate.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekNumber = Math.ceil(sessionDate.getDate() / 7);
          periodKey = `${sessionDate.getFullYear()}-W${weekNumber}`;
          break;
        case 'monthly':
          periodKey = sessionDate.toLocaleString('default', { month: 'short', year: 'numeric' });
          break;
        case 'service':
          periodKey = session.serviceId.name;
          break;
      }

      if (!acc[periodKey]) {
        acc[periodKey] = {
          earnings: 0,
          sessions: 0,
          period: periodKey
        };
      }

      acc[periodKey].earnings += session.totalCost;
      acc[periodKey].sessions++;

      return acc;
    }, {});

    const report = Object.values(earningsReport).sort((a, b) => {
      if (groupBy === 'service') return b.earnings - a.earnings;
      return new Date(b.period) - new Date(a.period);
    });

    res.status(200).json({
      report,
      totalEarnings: report.reduce((sum, item) => sum + item.earnings, 0),
      totalSessions: report.reduce((sum, item) => sum + item.sessions, 0)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function for vendor analytics
const getVendorAnalytics = async (vendorId, period) => {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case 'daily':
      startDate.setDate(now.getDate() - 30);
      break;
    case 'weekly':
      startDate.setDate(now.getDate() - 90);
      break;
    case 'monthly':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const sessions = await StreamingSession.find({
    vendorId,
    createdAt: { $gte: startDate },
    status: 'completed'
  });

  const analytics = sessions.reduce((acc, session) => {
    let key;
    const sessionDate = new Date(session.createdAt);
    
    switch (period) {
      case 'daily':
        key = sessionDate.toISOString().split('T')[0];
        break;
      case 'weekly':
        key = `Week ${Math.ceil(sessionDate.getDate() / 7)}-${sessionDate.getMonth() + 1}`;
        break;
      case 'monthly':
        key = sessionDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        break;
    }

    if (!acc[key]) {
      acc[key] = { earnings: 0, sessions: 0 };
    }
    
    acc[key].earnings += session.totalCost;
    acc[key].sessions++;
    
    return acc;
  }, {});

  return Object.entries(analytics).map(([period, data]) => ({
    period,
    earnings: Math.round(data.earnings * 100) / 100,
    sessions: data.sessions
  }));
};