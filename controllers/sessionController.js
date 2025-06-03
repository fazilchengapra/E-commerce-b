const axios = require('axios');
const Session = require('../model/Session');

exports.logSession = async (req) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';

    const geo = await axios.get(`https://ipapi.co/${ip}/json/`);
    console.log(geo.data);
    
    const country = geo.data.country_name || 'Unknown';
    const region = geo.data.region || '';
    const city = geo.data.city || '';
    

    // Upsert: update if exists, else create
    await Session.findOneAndUpdate(
      { user: req.userId },
      {
        ipAddress: ip,
        country,
        region,
        city,
        userAgent,
        updatedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

  } catch (error) {
    console.error('Error logging session:', error.message);
  }
};

// For admin dashboard: sessions grouped by country
exports.getSessionsByCountry = async (req, res) => {
  try {
    const stats = await Session.aggregate([
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching session stats' });
  }
};
