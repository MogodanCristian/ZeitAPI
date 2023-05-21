const router = require('express').Router();
const User  = require("../models/User");
const bcrypt = require('bcryptjs');
const Task = require('../models/Task');
const Project = require('../models/Project');
const {registerValidation,passwordValidation} = require('../validation');
const {verifyToken,verifyTokenAndAdmin, verifyTokenAndManager} = require('./verifyToken');
const {sendMailTo} = require('../utils/sendMail')

//CREATE USER
router.post('/register',verifyTokenAndAdmin ,async (req,res) => {
    //Validate before creating a user
    const {error} = registerValidation(req.body);
    if(error)
    {
        return res.status(400).send(error.details[0].message)
    }
    //check if user is in DB
    const emailExists = await User.findOne({email: req.body.email});
    if(emailExists){
        return res.status(400).send('Email already in database!');
    }
    //Hash the password
    const salt=await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);  
    //create user
    const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role
    });
    try {
        const emailContent = "Hello and welcome to Zeit! Hope you are ready to get to work as an " + req.body.role + "!\nHere are your login credentials:\nEmail: " + req.body.email + "\nPassword: " + req.body.password + "\nNote that you will have to change that password upon your first login.\nGood luck and have a good time!";
        const emailResponse = await sendMailTo(req.body.email, 'Account created', emailContent)
        const savedUser = await user.save();
        res.send({user: savedUser._id,
                  emailResponse: emailResponse});
    } catch (err) {
      if (err.name === 'ValidationError') {
        res.status(400).send('Invalid input data: ' + err.message);
    } else {
        res.status(500).send('Error saving user to database: ' + err.message);
    }
    }
})

//UPDATE PASSWORD
router.patch('/changePassword/:userID',async(req,res)=>
{
    try {
        const {error} = passwordValidation(req.body);
        if(error)
            {
                return res.status(400).send(error.details[0].message)
            }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const patchedUser = await User.findByIdAndUpdate({
            _id: req.params.userID
        },
        {
            $set:{
                password: hashedPassword
            }
        },
        {
            new: true
        })
        res.json(patchedUser);
    } catch (err) {
        res.json(err.message)
    }
})

//GET ALL USERS
router.get('/', verifyTokenAndManager,async(req, res) =>{
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.json({
            message: error
        }).status(400);
    }
})

//UPDATE USER DETAILS
router.put('/:userID',async(req,res) =>{
    try {
        if(req.body.hasOwnProperty('password'))
        {
            return res.json("You cannot modify the password here!")
        }
        const patched = await User.findByIdAndUpdate({
            _id: req.params.userID
        },{
            $set: req.body
        })
        res.json(patched);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//DELETE USER 
router.delete('/:userID', verifyTokenAndAdmin,async(req,res) =>{
    try {
        
        const deletedUser = await User.findById({
            _id: req.params.userID
        });
        if(deletedUser.role === "admin"){
            if(req.user._id == deletedUser._id)
            {
                return res.json("You shouldn't delete yourself!")
            }
        }
        await deletedUser.delete();
        res.json(deletedUser._id);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//GET USER PERFORMANCE
router.get('/performance/:userID', async (req, res) => {
    try {
      const tasks_completed = await Task.find({ completed_by: req.params.userID });
      const tasks_assisted = await Task.find({ assisted_by: req.params.userID });
      var completedCounter = [0, 0, 0, 0];
      var assistedCounter = [0, 0, 0, 0];
      for (var i = 0; i < tasks_completed.length; i++) {
        if (tasks_completed[i].difficulty === 'easy') {
          completedCounter[0]++;
        } else if (tasks_completed[i].difficulty === 'medium') {
          completedCounter[1]++;
        } else if (tasks_completed[i].difficulty === 'hard') {
          completedCounter[2]++;
        } else if (tasks_completed[i].difficulty === 'very hard') {
          completedCounter[3]++;
        }
      }
      for (var i = 0; i < tasks_assisted.length; i++) {
        if (tasks_assisted[i].difficulty === 'easy') {
          assistedCounter[0]++;
        } else if (tasks_assisted[i].difficulty === 'medium') {
          assistedCounter[1]++;
        } else if (tasks_assisted[i].difficulty === 'hard') {
          assistedCounter[2]++;
        } else if (tasks_assisted[i].difficulty === 'very hard') {
          assistedCounter[3]++;
        }
      }
      var performanceCount = [0, 0, 0, 0];
      for (var i = 0; i < 4; i++) {
        performanceCount[i] = assistedCounter[i] + completedCounter[i];
      }
      if (performanceCount.every(count => count === 0)) {
        res.json(1);
      }
      else if (performanceCount[0] + performanceCount[1] > performanceCount[1] + performanceCount[2] && 
          performanceCount[0] + performanceCount[1] > performanceCount[2] + performanceCount[3]) {
        res.json(1);
      } else if (performanceCount[1] + performanceCount[2] > performanceCount[0] + performanceCount[1] && 
                 performanceCount[1] + performanceCount[2] > performanceCount[2] + performanceCount[3]) {
        res.json(2);
      } else if (performanceCount[2] + performanceCount[3] > performanceCount[0] + performanceCount[1] && 
                 performanceCount[2] + performanceCount[3] > performanceCount[1] + performanceCount[2]) {
        res.json(3);
      }
      else if(performanceCount[0] + performanceCount[1] === performanceCount[1]+ performanceCount[2]){
        res.json(2);
      }
      else if(performanceCount[1] + performanceCount[2] === performanceCount[2]+ performanceCount[3]){
        res.json(3);
      }
      else if(performanceCount[0] + performanceCount[1] === performanceCount[2]+ performanceCount[3]){
        res.json(3);
      }
    } catch (error) {
      res.json({ message: error });
    }
  });

//GET ALL THE USERS NOT IN  A PROJECT CURRENTLY

router.get('/availableEmployees/:projectID', async (req, res) => {
  
    try {

      const project = await Project.findById(req.params.projectID);
  
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      const availableEmployees = await User.find({
        _id: { $nin: project.employees },
        role: {$ne: 'admin'}
      });
  
      res.status(200).json(availableEmployees);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

//GET SPECIFIC USER DETAILS
router.get('/getDetails/:userID', async(req, res) =>{
    try 
    {
       const user = await User.findById(req.params.userID)
       return res.status(200).json(user);
    } 
    catch (error) {
        res.status(400).json({message: error})
    }
})

router.post('/findByEmail', async(req,res) =>{
  try {
      const user = await User.find({email:req.body.email})
      return res.status(200).json(user[0]);
  } catch (error) {
    res.status(400).json({message: error})
  }
})

router.post('/sendEmail/forgotPassword', async(req,res) =>{
  try {
    const emailResponse = await sendMailTo(req.body.recip, req.body.subject, req.body.content)
    res.json(emailResponse)
}
  catch (error) {
    
  }
})

module.exports = router;
