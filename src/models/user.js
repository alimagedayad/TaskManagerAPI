const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const sharp = require('sharp')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("Weak password")
            }
        }
    },
    age:  {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})

    await user.save()
    return token
}

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'createdBy'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.statics.findByCreds = async(email, pass) => {
    const user = await User.findOne({ email })

    if(!user) {
        throw new Error('Unable to login [Email doesnt exist]')
    }

    const isMatch = await bcrypt.compare(pass, user.password)

    if(!isMatch){
        throw new Error('Unable to login [Password is wrong]')
    }

    return user
}

userSchema.pre('remove', async function(next) {
    const user = this

    await Task.deleteMany({ createdBy: user._id })

    next()
})

// Hash the plain
userSchema.pre('save', async function (next) {
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    console.log('just before creating')

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User