const router = require('express').Router();
const Task = require('../models/Task');
const jwt =  require('jsonwebtoken');
const {taskValidation} = require('../validation')
const Bucket = require('../models/Bucket');
const Project = require('../models/Project')
const { verifyTokenAndManagerAuthorization, verifyTokenAndAdmin, verifyToken } = require('./verifyToken');
const axios = require('axios');
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

//GET SUGGESTED EMPLOYEE

const priorityEnum = ["Low", "Medium", "High", "Urgent"];
const difficultyEnum = ["easy", "medium", "hard", "very hard"];

function calculateScore(priority, difficulty) {
    const priorityValue = priorityEnum.indexOf(priority) + 1;
    const difficultyValue = difficultyEnum.indexOf(difficulty) + 1;
    return priorityValue * difficultyValue;
  }
  
  // Define a function to calculate the performance level based on the score
  function calculatePerformanceLevel(score) {
    if (score >= 1 && score < 4) {
      return 1
    } else if (score >= 4 && score < 9) {
      return 2
    } else if (score >= 9 && score <= 16) {
      return 3
    }
  }

  router.post('/getRecommendedEmployee/:taskID', async(req,res) =>{
    const taskId = req.params.taskID;
    try {
        let project = await axios.get('http://localhost:3000/api/tasks/getProject/' + taskId);
        project = project.data
        const projectEmployees = await Project.findById(project._id).populate('employees');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const availableEmployees = projectEmployees.employees.filter(user => !user.is_working);
        const score = calculateScore(req.body.priority, req.body.difficulty)
        const performanceLevel = calculatePerformanceLevel(score)
        const employeesWithPerformance = await Promise.all(availableEmployees.map(async employee => {
            const response = await axios.get('http://localhost:3000/api/users/performance/'+employee._id);
            const employeeWithPerformance = {
                ...employee.toObject(),
                performance: response.data
            };
            return employeeWithPerformance;
        }));
        let suggestedEmployee = employeesWithPerformance.filter(employee => performanceLevel === employee.performance)[0]
        if(!suggestedEmployee)
        {
            suggestedEmployee = employeesWithPerformance.filter(employee => employee.performance > performanceLevel)[0];
            if (!suggestedEmployee) {
                suggestedEmployee = employeesWithPerformance.filter(employee => employee.performance < performanceLevel)[0];
            }
        }
        if(!suggestedEmployee) {
            return res.status(404).json({ message: 'No employee found' });
          } 
        else {
            return res.status(200).json(suggestedEmployee);
          }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.get('/getRemainingTasks/:taskID', async(req,res) =>{
    try {
        const bucket = await Bucket.findOne({ tasks: req.params.taskID });
    const remainingTasks = bucket.tasks.filter((task) => task.toString() !== req.params.taskID);

    const promises = remainingTasks
      .map(async (task) => {
        const t = await Task.findById(task);
        return t;
      });

    let arr = await Promise.all(promises);
    arr=arr.filter(task => task.progress !== 'Done' )

    res.json(arr);
      } catch (error) {
        res.json(error)
      }
})

router.get('/getTasksProgress/:projectID', async (req, res) => {
    try {
      const project = await Project.findById(req.params.projectID).populate({
        path: 'buckets',
        populate: {
          path: 'tasks',
          model: 'Task'
        }
      });
  
      const tasks = project.buckets.reduce((acc, bucket) => acc.concat(bucket.tasks), []);
      const possibleProgressStatuses = ['Not Started', 'In Progress', 'Stuck', 'Done'];
      const progressCounts = possibleProgressStatuses.reduce((acc, progress) => {
        acc[progress] = tasks.filter(task => task.progress === progress).length;
        return acc;
      }, {});
  
      res.json({
        progressCounts
      });
    } catch (error) {
      res.json({
        message: error.message
      });
    }
  });
  
module.exports = router;

