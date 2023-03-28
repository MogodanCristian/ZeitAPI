const Message = require('../models/Message');
const { messageValidation } = require('../validation');
const { verifyToken } = require('./verifyToken');

const router = require('express').Router();

router.post('/', verifyToken, async(req,res) =>{
    const {error} = messageValidation(req.body);
    if(error)
    {
        return res.status(400).send(error.details[0].message)
    }
    var message = new Message({
        subject: req.body.subject,
        body: req.body.body,
        sender: req.body.sender,
        receiver: req.body.receiver
    })
    try {
        const savedMessage = await message.save()
        res.json(savedMessage)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router;