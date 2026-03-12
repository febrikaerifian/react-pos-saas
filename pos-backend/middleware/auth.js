const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {

  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecretkey"
    );

    req.user = decoded;

    next();

  } catch (err) {
    console.error("JWT ERROR:", err.message);
    res.status(401).json({ message: 'Invalid token' });
  }

};
