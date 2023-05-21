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
        user:req.body.user
    })
    try {
        const savedMessage = await message.save()
        res.json(savedMessage)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/:userID', verifyToken, async (req, res) => {
    try {
      const messages = await Message.find({
        user:req.params.userID
      });
      res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;