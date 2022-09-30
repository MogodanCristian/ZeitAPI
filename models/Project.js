const mongoose =  require('mongoose');
const User = require('./User')
const Bucket = require('./Bucket')

const projectSchema =  new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    manager_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    buckets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bucket'
    }]
})

module.exports = mongoose.Schema('Project', projectSchema);