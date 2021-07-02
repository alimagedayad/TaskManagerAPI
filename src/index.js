// const multer = require('multer')
const express = require('express')
require('./db/mongoose')
// const User = require('./models/user')
// const Task = require('./models/task')
const UserRouter = require('./routers/user')
const TaskRouter = require('./routers/task')
// const auth = require('./middleware/auth')
const app = express()
const port = process.env.PORT

// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb) {
//         if(!file.originalname.match(/\.(doc|docx)$/)) {
//             return cb(new Error('Please upload a Word document!'))
//         }
//
//         cb(undefined, true)
//         // cb(new Error('File must be a PDF!'))
//     }
// })


// app.use((req, res, next) => {
//
//     if(req.method === 'GET') {
//         res.send('GET is not supported')
//     } else {
//         next()
//     }
//
// })

// app.use((req, res, next) => {
//     res.status(503).send('Site is under maintenance.')
// })



app.use(express.json())
app.use(UserRouter)
app.use(TaskRouter)


app.listen(port, () => {
    console.log('Server is up on port' , port)
})

// app.post('/upload', upload.single('upload'), (req,res) => {
//     res.send()
// }, (error, req, res, next) => {
//     res.status(400).send({ error: error.message })
// })

// const Task = require('./models/task')
//
// const main = async() => {
//     const task = await Task.findById('60d69e0618ea7c16594507c5')
//     await task.populate('owner').execPopulate()
//     console.log(task.createdBy)
// }
//
// main()