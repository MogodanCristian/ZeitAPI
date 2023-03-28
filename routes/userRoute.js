const router = require('express').Router();
const User  = require("../models/User");
const bcrypt = require('bcryptjs');
const Task = require('../models/Task');
const Project = require('../models/Project');
const {registerValidation,passwordValidation} = require('../validation');
const { verifyTokenAndAdmin, verifyTokenAndManager} = require('./verifyToken');

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
        const savedUser = await user.save();
        res.send({user: savedUser._id});
    } catch (err) {
        res.status(400).send(err);
    }
})

//UPDATE PASSWORD
router.patch('/changePassword/:userID', verifyTokenAndAdmin,async(req,res)=>
{
    try {
        const {error} = passwordValidation(req.body.password);
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
        res.json("Eroare")
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
router.put('/:userID', verifyTokenAndAdmin,async(req,res) =>{
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
router.get('/performance/:userID', async(req,res) =>{
    try {
        const tasks_completed = await Task.find({
            completed_by: req.params.userID
        })
        const tasks_assisted = await Task.find({
            assisted_by: req.params.userID
        })
        var completedCounter = [0,0,0,0];
        var assistedCounter = [0,0,0,0];
        for(var i=0;i<tasks_completed.length;i++)
        {
            if(tasks_completed[i].difficulty === "easy"){
                completedCounter[0]++
            }
            else if(tasks_completed[i].difficulty === "medium")
            {
                completedCounter[1]++;
            }
            else if(tasks_completed[i].difficulty === "hard"){
                completedCounter[2]++;
            }
            else if(tasks_completed[i].difficulty === "very hard"){
                completedCounter[3]++;
            }
        }
        for(var i=0;i<tasks_assisted.length;i++)
        {
            if(tasks_assisted[i].difficulty === "easy"){
                completedCounter[0]++
            }
            else if(tasks_assisted[i].difficulty === "medium")
            {
                completedCounter[1]++;
            }
            else if(tasks_assisted[i].difficulty === "hard"){
                completedCounter[2]++;
            }
            else if(tasks_assisted[i].difficulty === "very hard"){
                completedCounter[3]++;
            }
        }
        res.json({
            tasks_completed: {
                easy: completedCounter[0],
                medium: completedCounter[1], 
                hard: completedCounter[2],
                very_hard: completedCounter[3]
            },
            tasks_assisted:{
                easy: assistedCounter[0],
                medium: assistedCounter[1], 
                hard: assistedCounter[2],
                very_hard: assistedCounter[3]
            }
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//GET ALL THE USERS NOT IN  A PROJECT CURRENTLY

router.get('/availableEmployees/:projectID', async (req, res) => {
    const { projectId } = req.params;
  
    try {

      const project = await Project.findById(req.params.projectID);
  
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
  
      const availableEmployees = await User.find({
        _id: { $nin: project.employees },
        role: {$ne: ['admin', 'manager']}
      });
  
      res.status(200).json(availableEmployees);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports = router;

