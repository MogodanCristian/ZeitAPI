const mongoose = require('mongoose')
const Project = require('./Project')
const Task = require('./Task')

const bucketSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]
})

module.exports = mongoose.Schema("Bucket", bucketSchema);