const jwt = require('jsonwebtoken');
const Bucket = require('../models/Bucket');
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
    if(req.user.role === "manager" || req.user.role === "admin")
    {
      next();
    }
    else{
      res.status(403).json("Only managers are allowed to do that!");
    }
  })
}
//verifies if the user is a manager and if they can modify the project(only project managers can modify their own project) 
const verifyTokenAndManagerAuthorization=(req, res, next) => {
        verifyToken(req, res, async() => {
          if(req.params.projectID){
            const project = await Project.findById(req.params.projectID);
            if ((req.user.role === "manager" && req.user._id == project.manager_id) || req.user.role === "admin") {
                  next();
            } 
            else {
              res.status(403).json("Only the manager or admin that created the project is allowed to do that!");
            }
          }
          if(req.params.bucketID)
          {
            const project = await Project.find({
              buckets: req.params.bucketID
            })
            if((req.user.role === "manager" && req.user._id == project[0].manager_id) || req.user.role === "admin")
            {
              next();
            }
            else{
              res.status(403).json("Only the manager or admin that created the bucket is allowed to do that!");
            }
          }
          if(req.params.taskID){
            const bucket = await Bucket.find({
              tasks: req.params.taskID
            })
            const project = await Project.find({
              buckets: bucket[0]._id
            })
            if((req.user.role === "manager" && req.user._id == project[0].manager_id) || req.user.role === "admin")
            {
              next();
            }
            else{
              res.status(403).json("Only the manager or admin that created the task is allowed to do that!");
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
        verifyTokenAndManagerAuthorization,
        verifyTokenAndManager,
        verifyTokenAndAdmin
    }
      
      
