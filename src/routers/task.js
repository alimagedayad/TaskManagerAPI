const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt
router.get('/tasks', auth, async (req,res) => {

    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        // const tasks = await Task.find({createdBy: req.user._id})
        // const tasks = await Task.find({}
        //)
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
        console.log(e)
    }
    //
    // Task.find({}).then((user) => {
    //     if(!user){
    //         return res.status(404).send()
    //     }
    //     res.send(user)
    // }).catch((e) => {
    //     res.status(500).send(e)
    // })
})

router.get('/tasks/:id', auth, async(req,res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, createdBy: req.user._id})
        // const task = await Task.findById(_id)
        if (!task) {
            return res.status(404).send('Wrong user')
        }

        res.send(task)
    } catch (e) {
        console.log('e: ', e)
        res.status(500).send()
    }
})



router.patch('/tasks/:id', auth, async(req, res) => {
    const id = req.params.id
    const updates = Object.keys(req.body)
    const validOps = ['description', 'completed']
    const isValid = updates.every((update) => validOps.includes(update))

    if(!isValid){
        return res.status(400).send('Invalid update parameters')
    }

    try{
        const task = await Task.findOne({_id: req.params.id, createdBy: req.user._id})

        if(!task){
            return res.status(404).send()
        }

        // const task = await Task.findById(id)
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        //const task = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })

        if(!task){
            return res.status(404).send(`The task with this id ${id} is not found`)
        }

        res.send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async(req, res) => {
    try{
        // const user = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id })
        if(!task) {
            return res.status(404).send()
        }

        res.send(task)

    } catch(e) {
        res.status(500).send(e)
    }
})

router.post('/tasks', auth, async(req,res) => {
    //const task = new Task(req.body)

    const task = new Task({
        ...req.body,
        createdBy: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        console.log(e)
    }
    // task.save().then((task) => {
    //     res.status(201).send(task)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})

module.exports = router