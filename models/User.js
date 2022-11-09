const mongoose = require('mongoose');

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    last_name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: true,
        min: 8
    },
    role: {
        type: String,
        default: "employee",
        enum: [
            "admin",
            "employee",
            "manager"
        ]
    }
});

module.exports = mongoose.model('User',userSchema);