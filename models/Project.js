const mongoose =  require('mongoose');
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
        ref: 'Bucket',
        default : []
    }],
    employees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }]
})

module.exports = mongoose.model('Project', projectSchema);