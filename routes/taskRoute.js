const router = require('express').Router();
const Task = require('../models/Task');
const jwt =  require('jsonwebtoken');
const {taskValidation} = require('../validation')
const Bucket = require('../models/Bucket');
const { verifyTokenAndManagerAuthorization, verifyTokenAndAdmin } = require('./verifyToken');

//CREATE TASK
router.post('/:bucketID',verifyTokenAndManagerAuthorization ,async (req,res)=>{
    const {error} = taskValidation(req.body);
    if(error)
    {
        return res.status(400).send(error.details[0].message);
    }
    var start = req.body.start_date;
    var end = req.body.end_date;
    const task = new Task({
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority
    })
    task.start_date.push(start);
    task.end_date.push(end);
    try {
        const savedTask = await task.save();
        const patched = await Bucket.findByIdAndUpdate(
            {
                _id: req.params.bucketID
            },
            {
                $addToSet:{
                    tasks: savedTask
                }
            },
            {
                new: true
            }
        )
        res.json(patched);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//ASSIGN TASK TO USER
router.patch('/assign_task/:taskID', verifyTokenAndManagerAuthorization,async(req, res)=>
{
    try {
        const patched = await Task.findByIdAndUpdate({
            _id: req.params.taskID
        },
        {
            assigned_to: req.body.assigned_to
        },
        {
            new: true
        }
    );
    res.json(patched);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//DELETE TASK
router.delete('/:taskID', verifyTokenAndManagerAuthorization,async(req,res)=>{
    try {
        const bucketToUpdate = await Bucket.find({
            tasks: req.params.taskID
        })
        const patched = await Bucket.findByIdAndUpdate({
            _id: bucketToUpdate[0]._id
        },
        {
            $pull:{
                tasks: req.params.taskID
            }
        })
        const deleted = await Task.findByIdAndDelete({
            _id: req.params.taskID
        });
        res.json(deleted);
    } catch (error) {
        res.json(
            {
                message: error
            }
        )
    }
})

//GET ALL TASKS
router.get('/',verifyTokenAndAdmin,async(req,res)=>{
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//UPDATE TASK DETAILS
router.put('/:taskID', verifyTokenAndManagerAuthorization,async(req,res) =>{
    try {
        const patched = await Task.findByIdAndUpdate({
            _id: req.params.taskID
        },
        {
            $set: req.body
        })
        res.json(patched);
    } catch (error) {
        res.json({
            message: error
        })
    }
})
module.exports = router;