const router = require('express').Router();
const Task = require('../models/Task');
const jwt =  require('jsonwebtoken');
const {taskValidation} = require('../validation')
const Bucket = require('../models/Bucket');
const Project = require('../models/Project')
const { verifyTokenAndManagerAuthorization, verifyTokenAndAdmin, verifyToken } = require('./verifyToken');

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
        res.json(savedTask);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//GET ALL TASKS FOR BUCKET
router.get('/getTasks/:bucketID', verifyToken ,async(req,res)=>{
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

//ASSIGN TASK TO USER
// router.patch('/assign_task/:taskID', verifyTokenAndManagerAuthorization,async(req, res)=>
// {
//     try {
//         const patched = await Task.findByIdAndUpdate({
//             _id: req.params.taskID
//         },
//         {
//             assigned_to: req.body.assigned_to
//         },
//         {
//             new: true
//         }
//     );
//     res.json(patched);
//     } catch (error) {
//         res.json({
//             message: error
//         })
//     }
// })

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

router.get('/:taskID', verifyToken, async(req, res) =>{
    try {
        const task = await Task.find({
            _id: req.params.taskID
        })
        res.json(task).status(200)

    } catch (error) {
        res.json(error)
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
router.put('/:taskID', verifyToken,async(req,res) =>{
    try {
        const patched = await Task.findById({
            _id: req.params.taskID
    })
    if(patched.assigned_to == req.body.assisted_by && req.body.assisted_by!=null)
    {
        return res.json("You cannot assist in a task you have been assigned!");
    }
    if(req.body.assisted_by || req.body.completed_by)
    {
        if(!patched.assigned_to)
        {
            return res.json("You cannot complete or assist in an unassigned task!");
        }
        if(patched.previous)
        {
            const previous = await Task.findById({
                _id: patched.previous
            })
            if(previous.progress != "Done")
            {
                return res.json("You must complete the previous task first!")
            }
        }
    }
    if(req.body.assisted_by)
    {
        await patched.updateOne({
            $addToSet:{
                assisted_by: req.body.assisted_by
            }
        })
         return res.json(patched);
    }
    await patched.updateOne(req.body)
    return res.json(patched);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//GET THE PROJECT CONTAINING THE TASK
router.get('/getProject/:taskID', async(req,res) =>{
    const taskId = req.params.taskID;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    const bucket = await Bucket.findOne({ tasks: taskId });

    if (!bucket) {
      return res.status(404).json({ message: 'Bucket not found' });
    }
    const project = await Project.findOne({ buckets: bucket._id });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
module.exports = router;

