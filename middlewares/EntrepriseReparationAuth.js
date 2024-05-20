const jwt = require('jsonwebtoken');
const EntrepriseReparationS = require('../modules/EntrepriseReparationSchema');

const generateToken = (id ,role) => {
  return jwt.sign({ id , role}, process.env.SECRET_KEY , { expiresIn: '1h' });
};

const EntrepriseReparationAuthVerify = async (req, res, next) => {
  const token = req.cookies.token;

  try {
    if (!token) {
      return res.status(401).send('Access denied. No token provided.');
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const EntrepriseReparation = await EntrepriseReparationS.findById(decoded.id);

    if (!EntrepriseReparation || ( decoded.role !== "entrepriseReparation" && decoded.role !== "employee")) {
      return res.status(403).send('Access denied. Not a EntrepriseReparation.');
    }

    // If JWT is valid and signed with role "superEntrepriseReparation", proceed to the next middleware
    req.id = decoded.id
    next();
  } catch (error) {
    // Check if token has expired
    if (error.name === 'TokenExpiredError') {
      // If expired, generate a new token and set it in a cookie
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const newToken = generateToken(decoded.id, decoded.role);
      res.cookie('token', newToken, { httpOnly: true, maxAge: 3600000 }); // Expires in 1 hour
      req.id = decoded.id
      next(); // Continue to next middleware
    } else {
      // If other error, return unauthorized
      res.status(401).send('Unauthorized.');
    }
  }
};

module.exports = EntrepriseReparationAuthVerify;