const express = require("express")
const zod = require("zod");
const {User, Account} = require("../database/db")
const router = express.Router();
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const JWT_SECRET =  process.env.JWT_SECRET;
const {authMiddleware} = require("../middlewares")

const signupSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

router.post("/signup", async (req, res) => {
    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: result.error.issues,
        });
    }

    const { username, password, firstName, lastName } = result.data;

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if(existingUser) {
        return res.status(400).json({   // <-- changed from 411 to 400
            message: "Email already taken / Incorrect inputs"
        })
    }

    // hash password before storing
    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({
        username,
        password: hashed,
        firstName,
        lastName,
        authProvider: 'local'
    });

    const userId = user._id;
    
    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token,
        user: {
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
        }
    })
});

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
});

router.post("/signin", async(req, res) => {
    const { success } = signinBody.safeParse(req.body)
    if(!success) {
        return res.status(400).json({   // <-- changed from 411 to 400
            message: "Email already taken / Incorrect inputs"
        })
    }

    const user = await User.findOne({ username: req.body.username });
    if (!user) {
        return res.status(401).json({ message: 'Your credentials do not match. Please try again.' })
    }

    if (!user.password) {
        return res.status(400).json({ message: 'This account uses Google sign-in. Please continue with Google.' });
    }

    const match = await bcrypt.compare(req.body.password, user.password)
    if (!match) {
        return res.status(401).json({ message: 'Your credentials do not match. Please try again.' })
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET)
    res.json({
        token,
        user: {
            _id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
        }
    })
})

// return current logged-in user
router.get('/me', authMiddleware, async (req, res) => {
    try{
        const user = await User.findById(req.userId).select('-password')
        if(!user) return res.status(404).json({ message: 'User not found' })
        res.json({ user })
    }catch(err){
        res.status(500).json({ message: 'Server error' })
    }
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.put("/", authMiddleware, async (req, res) => {
    const result = updateBody.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "Invalid update data.",
            errors: result.error.issues,
        });
    }

    const updateData = result.data;

    await User.updateOne(
        { _id: req.userId },
        { $set: updateData } 
    );

    res.json({
        message: "Updated successfully"
    })
})

router.get("/bulk", async(req, res) => {
    const filter = req.query.filter || "";
    
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;
