const mongoose = require('mongoose')
const User = require('./User')

const taskSchema = mongoose.Schema({
    title: { 
        type: String, 
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default : Date.now
    },
    start_date: [{
        type: Date,
        default: Date.now,
        required: true
    }],
    end_date: [{
        type: Date,
        required: true
    }],
    completed_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    assisted_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        default: null
    },
    priority: {
        type: Number,
        required: true
    },
    previous: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    cost:{
        type: Number
    },
    started_working:{
        type: Date,
        default: Date.now
    },
    finished_working:{
        type: Date
    },
    recurrence:{
        type: Number
    }

})

module.exports = mongoose.model('Task',taskSchema);