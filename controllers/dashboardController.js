const User = require('../models/User'); // Import User model

const getDashboardData = async (req, res) => {
  try {
    const totalRegisteredUsers = await User.countDocuments(); // Count all users
    const totalLecturers = await User.countDocuments({ role: 'lecturer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalStudents = await User.countDocuments({ role: 'student' });

    res.json({
      totalRegisteredUsers,
      totalLecturers,
      totalAdmins,
      totalStudents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
};

module.exports = { getDashboardData };