const router = require('express').Router();
const User  = require("../models/User");
const bcrypt = require('bcryptjs');
const Task = require('../models/Task');
const {registerValidation,passwordValidation} = require('../validation');
const { verifyTokenAndAdmin } = require('./verifyToken');

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
router.patch('/change_password/:userID', verifyTokenAndAdmin,async(req,res)=>
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
router.get('/',verifyTokenAndAdmin ,async(req, res) =>{
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
        const deletedUser = await User.findByIdAndDelete({
            _id: req.params.userID
        });
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
        console.log(tasks_completed);
        console.log("\n\n");
        console.log(tasks_assisted);

        tasks_completed.forEach(async (task) =>{
            
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
})
module.exports = router;

