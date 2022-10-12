const router = require('express').Router();
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');
const{projectValidation} = require('../validation.js')
//CREATE PROJECT
router.post('/', async (req,res) =>{
    const {error} = projectValidation(req.body);
    if(error)
    {
        return res.status(400).send(error.details[0].message)
    }
    const project = new Project({
        title : req.body.title,
        description : req.body.description,
        manager_id : req.body.manager_id,
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
        const removed = await Project.remove({_id : req.params.projectID})
        res.json(removed);
    } catch (error) {
        res.json({ message: error })
    }
})

//UPDATE TITLE

router.patch('/:projectID', async(req,res) =>{
    try {
        const patched = await Project.updateOne(
            {_id : req.params.projectID},
            { $set: {title : req.body.title}});
            res.json(patched);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//UPDATE DESCRIPTION

router.patch('/:projectID', async(req,res) =>{
    try {
        const patched = await Project.updateOne(
            {_id : req.params.projectID},
            { $set: {description : req.body.description}});
            res.json(patched);
    } catch (error) {
        res.json({
            message: error
        })
    }
})

//UPDATE MANAGER

router.patch('/:projectID', async(req,res) =>{
    try {
        const patched = await Project.updateOne(
            {_id : req.params.projectID},
            { $set: {manager_id : req.body.manager_id}});
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
module.exports = router;

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