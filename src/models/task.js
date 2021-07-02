const mongoose = require('mongoose')
const validator = require('validator')

const TaskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { timestamps: true })

const Task = mongoose.model('Task', TaskSchema)

module.exports = Task