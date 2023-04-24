const router = require('express').Router();
const Project = require('../models/Project');
const Bucket = require('../models/Bucket');
const jwt = require('jsonwebtoken');
const{projectValidation} = require('../validation.js');
const Task = require('../models/Task');
const{verifyToken, verifyTokenAndManagerAuthorization,verifyTokenAndManager, verifyTokenAndAdmin}=require('./verifyToken');
const User = require('../models/User');

//CREATE PROJECT
router.post('/:managerID', verifyTokenAndManager ,async (req,res) =>{
    //PROJECT VALIDATION
    const {error} = projectValidation(req.body);
    if(error)
    {
        return res.status(400).send(error.details[0].message)
    }
    var project = new Project({
        title : req.body.title,
        description : req.body.description,
        manager_id : req.params.managerID,
        start_date: req.body.start_date,
        end_date: req.body.end_date
    });
    project.employees.push(req.params.managerID);
    try {
        const savedProject = await project.save();
        res.json(savedProject)
    } catch (error) {
        res.status(400).send(error);
    }
});

//DELETE PROJECT 
router.delete('/:projectID', verifyTokenAndManagerAuthorization,async(req, res) =>{
    try {
        const projectToRemove = await Project.findById({_id : req.params.projectID});
        projectToRemove.buckets.forEach(async (bucket) => {
            const b = await Bucket.findById(bucket);
            if(b){
            b.tasks.forEach(async (task)=>{
                const t = await Task.findById(task);
                if(t){
                    await Task.remove({_id: t._id})
                }
            })
            await Bucket.remove({_id: b._id});}
               
        });

        await Project.remove({_id : req.params.projectID});
        return res.status(200).json("Project deleted successfully");
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
})

//UPDATE PROJECT DETAILS

router.put('/:projectID',verifyTokenAndManagerAuthorization ,async(req,res) =>{
    try {
        const patched = await Project.findByIdAndUpdate(
            {_id : req.params.projectID},
            { $set: req.body},{
                new: true
            });
        res.json(patched);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

// GET ALL PROJECTS

router.get('/' ,verifyTokenAndAdmin,async (req,res) =>{
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.json({message : error})
    }
})

//GET ALL PROJECTS BY USER_ID
router.get('/find/:user_id',verifyToken,async (req, res) =>{
    try {
        const projects = await Project.find({ 
            employees: {$in: req.params.user_id}
        })
        res.json(projects);
    } catch (error) {
        res.json({
            message : error
        })
    }
})

//ADD EMPLOYEE TO PROJECT

router.patch('/addEmployee/:projectID', verifyTokenAndManagerAuthorization ,async(req,res) =>{
    try {
        const patched = await Project.findOneAndUpdate(
            {
                _id: req.params.projectID
            },
            {$addToSet: {employees: req.body.employee_id}},
            {new: true});
        res.json(patched);
    } catch (error) {
        res.json({
            message: error
        })
    }
}) 

//ADD BUCKET TO PROJECT -- Could implement move bucket

// router.patch('/add_buckets/:projectID', verifyTokenAndManagerAuthorization ,async(req,res) =>{
//     try {
//         const patched = await Project.updateOne(
//             {
//                 _id: req.params.projectID
//             },
//             {
//                 $addToSet: {buckets: req.body.bucket_ID}
//             },
//             {
//                 new: true
//             }
//         )
//         res.json(patched);
        
//     } catch (error) {
//         res.json({
//             message: error
//         })
        
//     }
// })


//DELETE USER FROM PROJECT
router.patch('/removeEmployee/:projectID', verifyTokenAndManagerAuthorization,async(req,res) =>{
    try {
        const patched = await Project.updateOne(
            {_id: req.params.projectID},
            {$pull: {employees: req.body.employee_id}},
            {new: true});
        res.json(patched);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//GET ALL EMPLOYEES IN A PROJECT

router.get('/:projectID/employees', verifyToken, async(req, res)=>{
    try {
        const project = await Project.find(
            {_id: req.params.projectID}
        )
        let arr = []
        const promises = project[0].employees.map(async(employee) => {
            const e = await User.findById(employee);
            return e;
        });
        arr = await Promise.all(promises);
        res.json(arr)
        
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//GET SPECIFIC PROJECT DETAILS

router.get('/:projectID', verifyToken, async(req, res) =>{
    try {
        const project = await Project.findById(
            {
                _id: req.params.projectID
            }
        )
        res.json(project)
    } catch (error) {
        res.json({
            message: error
        })
        
    }
})
router.get('/getAvailableEmployees/:projectID', async(req, res) =>{
    const projectID = req.params.projectID;

    try {
      // Find the project with the given ID
      const project = await Project.findById(projectID).populate('employees');
  
      if (!project) {
        // Project not found
        return res.status(404).json({ message: 'Project not found' });
      }
  
      // Filter the users that have the is_working field set to false
      const availableEmployees = project.employees.filter(user => !user.is_working);
  
      // Return the available employees
      res.json(availableEmployees);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
})
//implementare de vizualizare a progresului
module.exports = router;