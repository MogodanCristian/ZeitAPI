const router = require('express').Router();
const User = require('../models/User');
const {registerValidation, loginValidation} = require('../validation')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.post('/register', async (req,res) => {
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

//LOGIN
router.post('/login', async (req, res) =>{
    const {error} = loginValidation(req.body);
    if(error)
    {
        return res.status(400).send(error.details[0].message)
    }
    //check if user is in DB
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return res.status(400).send('Email is wrong!');
    }
    //Check if paswornd is ok
    const validPassword =  await bcrypt.compare(req.body.password,user.password);
    if(!validPassword) return res.status(400).send('Password is wrong!');
    
    //Create and assign a web token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token).status(200);
})

module.exports = router;
