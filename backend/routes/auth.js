const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Student,Faculty, User} = require("../models/users")

const router = express.Router()

router.post('/register/student',async (req,res) => {
    try{
        const {email, password, rollNo, division, firstName, lastName}=req.body
        const hashPassword = await bcrypt.hash(password,10);
        const stud = new Student({
            email : email,
            password: hashPassword,
            rollNo : rollNo,
            division: division,
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
        })
        await stud.save();
        res.status(201).json({message: "Student Created Successfully!"})
    } catch (err){
        console.log(err); //remove this at the end
        if(err.code == 11000){
            res.status(400).json({ error : 'Mail Already Exists'})
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
})

router.post('/register/students/bulk', async (req, res) => {
    try {
        const students = req.body; // expecting an array

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ error: 'Invalid input. Expected an array of students.' });
        }

        const hashedStudentsPromises = students.map(async ({ email, password, rollNo, division, firstName, lastName }) => {
            const hashPassword = await bcrypt.hash(password, 10);
            return {
                email,
                password: hashPassword,
                rollNo,
                division,
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
            };
        });

        const hashedStudents = await Promise.all(hashedStudentsPromises);

        const result = await Student.insertMany(hashedStudents, { ordered: false });

        res.status(201).json({
            message: `${result.length} students registered successfully.`,
            insertedCount: result.length
        });
    } catch (err) {
        console.log(err); // Remove in production

        if (err.code === 11000 || err.writeErrors) {
            const duplicates = err.writeErrors?.filter(e => e.code === 11000).length || 0;
            return res.status(400).json({
                error: `Some students could not be registered due to duplicate emails or roll numbers.`,
                duplicateCount: duplicates
            });
        }

        res.status(500).json({ error: 'Bulk student registration failed.' });
    }
});

router.post('/register/user',async (req,res) => {
    try{
        const {email, password, firstName, lastName}=req.body
        const hashPassword = await bcrypt.hash(password,10);
        const stud = new User({
            email : email,
            password: hashPassword,
            role : 'user',
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
        })
        await stud.save();
        res.status(201).json({message: "User Created Successfully!"})
    } catch (err){
        console.log(err); //remove this at the end
        if(err.code == 11000){
            res.status(400).json({ error : 'Mail Already Exists'})
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
})

router.post('/register/faculty',async (req,res) => {
    try{
        const {email, password, firstName, lastName, prefix}=req.body
        const hashPassword = await bcrypt.hash(password,10);
        const faculty = new Faculty({
            email : email,
            password: hashPassword,
            ...(prefix && { prefix }),
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
        })
        await faculty.save();
        res.status(201).json({message: "Faculty Created Successfully!"})
    } catch (err){
        console.log(err); //remove this at the end
        if(err.code == 11000){
            res.status(400).json({ error : 'Mail Already Exists'})
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
})


router.post('/login', async (req,res) => {
    try{
        const { email, password } = req.body

        const user = await User.findOne({email});
        
        if(!user){
            res.status(401).json({error : "User Not Found!"})
        }

        const hashPw = await bcrypt.hash(password,10);
        const pwdMatch = bcrypt.compare(user.password,hashPw)

        if(!pwdMatch){
            res.status(401).json({error: "Incorrect Password"})
        }

        const userPayload = user.toObject();
        delete userPayload.password;

        const token = jwt.sign(userPayload,process.env.SECRET_KEY,{
            expiresIn: "1h"
        })

        res.status(200).json({token})
    } catch(err){
        res.status(500).json({error : err.message})
    }
})

module.exports = router