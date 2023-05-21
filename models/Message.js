const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    body: {
        type: String,
    },
    is_read:{
        type:Boolean,
        default:false
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    timestamp: {
        type: Date,
        default : Date.now
    },
})

module.exports = mongoose.model("Message", messageSchema);