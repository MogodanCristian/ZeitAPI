const mongoose = require('mongoose')
const User = require('./User')

const taskSchema = mongoose.Schema({
    title: { 
        type: String, 
        required: true
    },
    description: {
        type: String,
    },
    created_at: {
        type: Date,
        default : Date.now
    },
    start_date: [{
        type: Date,
        default: Date.now,
    }],
    end_date: [{
        type: Date,
    }],
    completed_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    assisted_by: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }],
    priority: {
        type: String,
        default: "low",
        enum: [
            "Low",
            "Medium",
            "High",
            "Urgent"
        ]
    },
    previous: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        default: null
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
    assigned_to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    difficulty:{
        type: String,
        default: "easy",
        enum: [
            "easy",
            "medium",
            "hard",
            "very hard"
        ]
    }
})

module.exports = mongoose.model('Task',taskSchema);