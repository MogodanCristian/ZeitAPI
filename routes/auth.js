const router = require('express').Router();
const User = require('../models/User');
const {registerValidation} = require('../validation')


router.post('/register', async (req,res) => {
    //Validate before creating a user
    const {error} = registerValidation(req.body);
    if(error)
    {
        return res.status(400).send(error.details[0].message)
    }
    const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
    });
    try {
        const savedUser = await user.save();
        res.send(savedUser);
    } catch (err) {
        res.status(400).send(err);
    }
})

router.post('/login')

module.exports = router;
