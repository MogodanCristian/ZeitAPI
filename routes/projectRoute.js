const router = require('express').Router();
const Project = require('../models/Project');
const Bucket = require('../models/Bucket');
const jwt = require('jsonwebtoken');
const{projectValidation} = require('../validation.js');
const Task = require('../models/Task');

//CREATE PROJECT
router.post('/:managerID', async (req,res) =>{
    //PROJECT VALIDATION
    const {error} = projectValidation(req.body);
    if(error)
    {
        return res.status(400).send(error.details[0].message)
    }
    const project = new Project({
        title : req.body.title,
        description : req.body.description,
        manager_id : req.params.managerID,
    });
    try {
        const savedProject = await project.save();
        res.send({project: savedProject._id});
    } catch (error) {
        res.status(400).send(error);
    }
});

//DELETE PROJECT 

router.delete('/:projectID', async(req, res) =>{
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
        return res.status(200).json("project deleted successfully");
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
})

//UPDATE PROJECT DETAILS

router.put('/:projectID', async(req,res) =>{
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

router.get('/', async (req,res) =>{
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.json({message : error})
    }
})

//GET ALL PROJECTS BY MANAGER_ID

router.get('/find/:manager_id', async (req, res) =>{
    try {
        const projects = await Project.find({ manager_id: {$in: req.params.manager_id}})
        res.json(projects);
    } catch (error) {
        res.json({
            message : error
        })
    }
})

//ADD EMPLOYEE TO PROJECT

router.patch('/add_employees/:projectID', async(req,res) =>{
    try {
        const patched = await Project.updateOne(
            {_id: req.params.projectID},
            {$push: {employees: req.body.employee_id}},
            {new: true});
        res.json(patched);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//ADD BUCKET TO PROJECT -- MOVE BUCKET TO

router.patch('/add_buckets/:projectID', async(req,res) =>{
    try {
        const patched = await Project.updateOne(
            {
                _id: req.params.projectID
            },
            {
                $push: {buckets: req.body.bucket_ID}
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

//GET ALL BUCKETS FOR PROJECT
router.get('/:projectID', async(req,res)=>{
    try {
        const project = await Project.findById({
            _id: req.params.projectID
        });
        var buckets = [];
        for(var i=0; i < project.buckets.length; i++){
            const b = await Bucket.findById(project.buckets[i]);
            buckets.push(b);
        }
        res.json(buckets);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

module.exports = router;