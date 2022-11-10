const router = require('express').Router();
const User = require('../models/User');
const {loginValidation} = require('../validation')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
    const token = jwt.sign({
        _id: user._id,
        role: user.role}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token).status(200);
})

module.exports = router;
