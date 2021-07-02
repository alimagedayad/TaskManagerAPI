const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, goodbyeEmail } = require('../emails/account')

router.post('/users', async(req, res) => {
    const user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})

    } catch (e) {
        res.status(400).send(e)
    }

    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(500).send(e)
    // })
})

router.post('/users/login', async(req,res) => {
    try{
        const user = await User.findByCreds(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({user, token})
    } catch(e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', auth,async(req,res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async(req, res) => {
    // try{
    //     const users = await User.find({})
    //     res.send(users)
    // } catch(e) {
    //     res.status(500).send()
    // }
    res.send(req.user)
})

router.patch('/users/me', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates! '})
    }

    try{
        const user = req.user
        // const user = await User.findById(req.params.id)

        updates.forEach((update) => user[update] = req.body[update])

        await user.save()

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true,
        //     runValidators: true
        // })
        // if(!user){
        //     return res.status(404).send()
        // }
        res.send(user)
    } catch(e) {
        res.status(400).send(e)
    }

    // Task.findById(_id).then((task) => {
    //
    //
    //     res.send(task)
    // }).catch((e) => {
    //     res.status(500).send(e)
    // })
})

router.delete('/users/me', auth, async(req, res) => {

    try{
        const user = req.user
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user) {
        //     return res.status(404).send()
        // }
        goodbyeEmail(user.email, user.name)
        await req.user.remove()
        res.send(req.user)

    } catch(e) {
        res.status(500).send(e)
    }
})

const userMulter = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Unsupported format; please use (.jpg, jpeg, png)'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar',  auth, userMulter.single('upload'), async(req,res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar =  buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async(req,res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})

module.exports = router