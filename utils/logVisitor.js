const VisitorLog = require('../model/VisitorLog');
const moment = require('moment');

const logVisitor = async (req) => {
    const userId = req.userId || null;
  if (!userId) return; // Skip guest or unauthenticated users (optional)

  const startOfHour = moment().startOf('hour').toDate();
  const endOfHour = moment().endOf('hour').toDate();

  const alreadyLogged = await VisitorLog.exists({
    user: userId,
    visitedAt: { $gte: startOfHour, $lte: endOfHour } 
  });

  if (!alreadyLogged) {
    await VisitorLog.create({
      user: userId,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  }
};

module.exports = logVisitor;
