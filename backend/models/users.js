const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email : { 
        type: String, 
        required: true, 
        unique : true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
    },
    password : { 
        type: String, 
        required: true 
    },
    firstName : {
        type : String
    },
    lastName : {
        type : String
    }
},{ discriminatorKey: 'role' })

const memberSchema = mongoose.Schema({
    rollNo : {
        type: String,
        required : true,
        unique: true,
    },
    division : {
        type : Number,
        required : true
    }
})

const facultySchema = mongoose.Schema({
    prefix : {
        type: String,
    },
    branch : {
        type : String
    }
})

const User = mongoose.model('User',userSchema)
const Student = User.discriminator('student',memberSchema)
const Parent = User.discriminator('parent',memberSchema)
const Faculty = User.discriminator('faculty',facultySchema)

module.exports = { User, Student, Parent, Faculty }