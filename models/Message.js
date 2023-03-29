const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
    },
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    

})

module.exports = mongoose.model("Message", messageSchema);