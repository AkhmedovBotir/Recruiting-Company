const jwt = require('jsonwebtoken');
const Candidate = require('../models/Candidate');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.candidate = await Candidate.findById(decoded.id);

      if (!req.candidate) {
        return res.status(401).json({
          success: false,
          message: 'Candidate not found',
        });
      }

      if (!req.candidate.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Candidate account is deactivated',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = { protect };

