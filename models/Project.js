const mongoose =  require('mongoose');

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
    }],
    start_date: {
        type: Date,
        default: Date.now,
        required: true
    },
    end_date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    has_problems:{
        type:Boolean,
        default:false,
    }
})

module.exports = mongoose.model('Project', projectSchema);