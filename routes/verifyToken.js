const jwt = require('jsonwebtoken')

module.exports = function auth(req, res, next){
    const token = req.header('auth-token');
    if(!token) return res.status(401).send("Access denied!");

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next()
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
    // const verifyToken = (req, res, next) => {
    //     const authHeader = req.headers.token;
    //     if (authHeader) {
    //       const token = authHeader.split(" ")[1];
    //       jwt.verify(token, process.env.JWT_SEC, (err, user) => {
    //         if (err) res.status(403).json("Token is not valid!");
    //         req.user = user;
    //         next();
    //       });
    //     } else {
    //       return res.status(401).json("You are not authenticated!");
    //     }
    //   };
      
    //   const verifyTokenAndAuthorization = (req, res, next) => {
    //     verifyToken(req, res, () => {
    //       if (req.user.id === req.params.id || req.user.isAdmin) {
    //         next();
    //       } else {
    //         res.status(403).json("You are not alowed to do that!");
    //       }
    //     });
    //   };
      
    //   const verifyTokenAndAdmin = (req, res, next) => {
    //     verifyToken(req, res, () => {
    //       if (req.user.isAdmin) {
    //         next();
    //       } else {
    //         res.status(403).json("You are not alowed to do that!");
    //       }
    //     });
    //   };

}