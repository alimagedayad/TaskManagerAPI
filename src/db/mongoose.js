const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,  // TODO: Understand it
    useUnifiedTopology: true // TODO: Understand it
})