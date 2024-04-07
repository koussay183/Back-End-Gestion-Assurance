const jwt = require('jsonwebtoken');
const UserS = require('../modules/UserSchema');

const generateToken = (id ,role) => {
  return jwt.sign({ id , role}, process.env.SECRET_KEY , { expiresIn: '1h' });
};

const UserAuthVerify = async (req, res, next) => {
  const token = req.cookies.token;

  try {
    if (!token) {
      return res.status(401).send('Access denied. No token provided.');
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await UserS.findById(decoded.id);

    if (!user || decoded.role !== "user") {
      return res.status(403).send('Access denied. Not a User.');
    }

    // If JWT is valid and signed with role "User", proceed to the next middleware
    req.userId = decoded.id;
    next();
  } catch (error) {
    // Check if token has expired
    if (error.name === 'TokenExpiredError') {
      // If expired, generate a new token and set it in a cookie
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const newToken = generateToken(decoded.id, decoded.role);
      res.cookie('token', newToken, { httpOnly: true, maxAge: 3600000 }); // Expires in 1 hour
      req.userId = decoded.id;
      next(); // Continue to next middleware
    } else {
      // If other error, return unauthorized
      res.status(401).send('Unauthorized.');
    }
  }
};

module.exports = UserAuthVerify;