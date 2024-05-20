const jwt = require('jsonwebtoken');
const BoutiqueS = require('../modules/BoutiqueSchema');

const generateToken = (id ,role) => {
  return jwt.sign({ id , role}, process.env.SECRET_KEY , { expiresIn: '1h' });
};

const BoutiqueAuthVerify = async (req, res, next) => {
  
  const token = req.cookies?.token;
  try {
    
    if (!token) {
      return res.status(401).send('Access denied. No token provided.');
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const Boutique = await BoutiqueS.findById(decoded.id);
    
    if ( !Boutique || ( decoded.role !== "boutique" && decoded.role !== "employee" )) {
      return res.status(403).send('Access denied. Not a Boutique.');
    }

    // If JWT is valid and signed with role "superBoutique", proceed to the next middleware
    req.boutiqueId = decoded.id
    next();
  } catch (error) {
    // Check if token has expired
    if (error.name === 'TokenExpiredError') {
      // If expired, generate a new token and set it in a cookie
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const newToken = generateToken(decoded.id, decoded.role);
      res.cookie('token', newToken, { httpOnly: true, maxAge: 3600000 }); // Expires in 1 hour
      req.boutiqueId = decoded.id
      next(); // Continue to next middleware
    } else {
      // If other error, return unauthorized
      res.status(401).send('Unauthorized.');
    }
  }
};

module.exports = BoutiqueAuthVerify;