const router = require('express').Router();
const Bucket = require('../models/Bucket');
const jwt = require('jsonwebtoken');
const Project = require('../models/Project');
const { bucketValidation } = require('../validation');
const Task = require('../models/Task');
const { verifyTokenAndAdmin, verifyTokenAndManagerAuthorization, verifyToken } = require('./verifyToken');

//CREATE BUCKET
router.post('/:projectID',verifyTokenAndManagerAuthorization,async (req,res) =>{
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
                $addToSet : {buckets: savedBucket},
                
            },
            {
                new: true
            })
        res.json(savedBucket)
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//GET BUCKET DETAILS
router.get('/:bucketID', verifyToken ,async(req,res) =>{
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
router.put('/:bucketID',verifyTokenAndManagerAuthorization,async(req,res)=>{
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
router.get('/',verifyToken,async(req,res)=>{
    try {
    const buckets = await Bucket.find();
    res.json(buckets);
} catch(error){
    res.json({message: error})
}
})

//DELETE BUCKET
router.delete('/:bucketID', verifyTokenAndManagerAuthorization ,async(req,res)=>{
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
// router.patch('/add_task/:bucketID', verifyTokenAndManagerAuthorization,async(req,res)=>{
//     try {
//         const patched = await Bucket.findByIdAndUpdate({
//             _id: req.params.bucketID
//         },
//         {
//             $addToSet:{
//                 tasks: req.body.task_ID
//             }
//         },
//         {
//             new: true
//         });
//         res.json(patched);
//     } catch (error) {
//         res.json({
//             message: error
//         })
//     }
    
// })



router.get('/getBuckets/:projectID',verifyToken , async(req,res)=>{
    console.log(req.params)
    try {
        const project = await Project.findById({
            _id: req.params.projectID
        });
        var buckets = [];
        for(var i=0; i < project.buckets.length; i++){
            const b = await Bucket.findById(project.buckets[i]);
            buckets.push(b);
        }
        console.log(buckets)
        res.json(buckets);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

module.exports = router;

//GET ALL BUCKETS FOR PROJECT
router.get('/getEmployeeBuckets/:projectID/:userID', async (req, res) => {
    try {
      const tasks = await Project.findById(req.params.projectID).populate({
        path: 'buckets',
        populate: {
          path: 'tasks',
          model: 'Task',
          match: { assigned_to: req.params.userID }, // Filter tasks by assigned_to field
        },
      });
  
      // Extract buckets that have tasks assigned to the user
      const filteredBuckets = tasks.buckets.filter((bucket) =>
        bucket.tasks.length > 0
      );
  
      res.json(filteredBuckets);
    } catch (error) {
      // Handle error
      res.status(500).json({ error: 'Internal server error' });
    }
  });


//GET BUCKETS OF TASKS FOR EACH USER WITH THE CORESSPONDING TASK TITLES