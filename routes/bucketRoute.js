const router = require('express').Router();
const Bucket = require('../models/Bucket');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const { projectValidation } = require('../validation');

//CREATE BUCKET
router.post('/:projectID', async (req,res) =>{
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

module.exports = router;