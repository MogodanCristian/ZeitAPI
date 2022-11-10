const jwt = require('jsonwebtoken')
const Project = require('../models/Project')

const verifyToken=async(req, res, next)=>{
    const token = req.header('auth-token');
    if(!token) return res.status(401).send("Access denied!");

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next()
    } catch (err) {
        res.status(400).send('Invalid Token');
    }}
    
//verifies if the user is a manager and if they can modify the project(only project managers can modify their own project) 
const verifyTokenAndManagerAuthorisation=(req, res, next) => {
        verifyToken(req, res, async() => {
          const project = await Project.findById(req.params.projectID);
          if (req.user.role === "manager" && req.user._id == project.manager_id) {
                next();
          } 
          else {
            res.status(403).json("You are not alowed to do that!");
          }
        });
      };
const verifyTokenAndAdmin = (req, res, next) => {
        verifyToken(req, res, () => {
          if (req.user.role === "admin") {
            next();
          } else {
            res.status(403).json("You are not alowed to do that!");
          }
        });
      };
    module.exports = {
        verifyToken,
        verifyTokenAndManagerAuthorisation
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
      
    
      
      
