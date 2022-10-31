const router = require('express').Router();
const Bucket = require('../models/Bucket');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const { bucketValidation } = require('../validation');
const Task = require('../models/Task');

//CREATE BUCKET
router.post('/:projectID', async (req,res) =>{
    //BUCKET VALIDATION
    const {error} = bucketValidation(req.body);
    if(error)
    {
        return res.status(400).send(error.details[0].message)
    }
    const bucket = new Bucket({
        title: req.body.title
    });
    try {
        const savedBucket = await bucket.save();
        const patched = await Project.findByIdAndUpdate(
            {
                _id: req.params.projectID
            },
            {
                $push : {buckets: savedBucket},
                
            },
            {
                new: true
            })
        res.json(patched)
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//GET BUCKET DETAILS
router.get('/:bucketID', async(req,res) =>{
    try {
        const bucket = await Bucket.find({
            _id: req.params.bucketID
        })
        res.json(bucket)
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//UPDATE DETAILS
router.put('/:bucketID', async(req,res)=>{
    try{
        const patched = await Bucket.findByIdAndUpdate(
        {_id: req.params.bucketID},
        {
            $set: req.body
        });
    res.json(patched);
}
    catch(error){
        res.json({
            message: error
        })
    }
})
//GET ALL BUCKETS
router.get('/', async(req,res)=>{
    try {
    const buckets = await Bucket.find();
    res.json(buckets);
} catch(error){
    res.json({message: error})
}
})

//DELETE BUCKET
router.delete('/:bucketID', async(req,res)=>{
    try {
        const projectToUpdate = await Project.find({
            buckets: req.params.bucketID
        })
        const patched =  await Project.findByIdAndUpdate({
            _id: projectToUpdate[0]._id
        },
        {
            $pull:{
                buckets: req.params.bucketID
            }
        })
        const bucket = await Bucket.findById({
            _id: req.params.bucketID
        })
        bucket.tasks.forEach(async(task) => {
            const t = await Task.findById(task);
            if(t)
            {
                await Task.remove({_id:t._id})
            }
        });
        const removed = await Bucket.remove(
            {_id: req.params.bucketID});
        res.json(removed);
    } catch (error) {
        res.json({message: error})
    }
})

//ADD TASK TO BUCKET
router.patch('/add_task/:bucketID', async(req,res)=>{
    try {
        const patched = await Bucket.findByIdAndUpdate({
            _id: req.params.bucketID
        },
        {
            $push:{
                tasks: req.body.task_ID
            }
        },
        {
            new: true
        });
        res.json(patched);
    } catch (error) {
        res.json({
            message: error
        })
    }
    
})

//GET ALL TASKS FOR BUCKET
router.get('/:bucketID', async(req,res)=>{
    try {
        const bucket = await Bucket.findById({
            _id: req.params.bucketID
        });
        var tasks = [];
        for(var i=0;i < bucket.tasks.length;i++){
            const t = await Task.findById(bucket.tasks[i]);
            tasks.push(t);
        }
        res.json(tasks);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

module.exports = router;