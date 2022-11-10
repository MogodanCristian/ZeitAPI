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

const verifyTokenAndManager = (req,res,next) => {
  verifyToken(req,res,()=>{
    if(req.user.role === "manager")
    {
      next();
    }
    else{
      res.status(403).json("Only managers are allowed to do that!");
    }
  })
}
//verifies if the user is a manager and if they can modify the project(only project managers can modify their own project) 
const verifyTokenAndManagerAuthorisation=(req, res, next) => {
        verifyToken(req, res, async() => {
          if(req.params.projectID){
            const project = await Project.findById(req.params.projectID);
            if (req.user.role === "manager" && req.user._id == project.manager_id) {
                  next();
            } 
            else {
              res.status(403).json("Only the manager that created the project is allowed to do that!");
            }
          }
          if(req.params.bucketID)
          {
            const project = await Project.find({
              buckets: req.params.bucketID
            })
            console.log(project)
            if(req.user.role === "manager" && req.user._id == project[0].manager_id)
            {
              next();
            }
            else{
              res.status(403).json("Only the manager that created the bucket is allowed to do that!");
            }
          }
        });
      };


const verifyTokenAndAdmin = (req, res, next) => {
        verifyToken(req, res, () => {
          if (req.user.role === "admin") {
            next();
          } else {
            res.status(403).json("Only admins are allowed to do that!");
          }
        });
      };
    module.exports = {
        verifyToken,
        verifyTokenAndManagerAuthorisation,
        verifyTokenAndManager,
        verifyTokenAndAdmin
    }
      
      
