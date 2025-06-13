const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/Users');
const bcrypt = require('bcrypt');
require('dotenv').config()

const app = express();
const port = process.env.PORT

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("MongoDB connected successfully.");
}).catch((error) => {
    console.error("MongoDB connection error:", error);
});


app.use(cors({
    origin: ['http://localhost:5173'], // ?
}));

app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
    const { email, username, password, confirmPassword } = req.body;
    if (!email || !username || !password) {
        return res.json({ msg: "All fields are required.", msgType: "error"  });
    }
    if (password.length < 8) {
        return res.json({ msg: "Password must be at least 8 characters long.", msgType: "error"  });
    }
    if (password !== confirmPassword) {
        return res.json({ msg: "Passwords do not match.", msgType: "error"  });
    }
    const checkEmail = await User.where("email").equals(email.toLowerCase())
    if (checkEmail.length > 0) {
        return res.json({ msg: "This email is already registered.", msgType: "error"  });
    }
    const checkUsername = await User.where("username").equals(username)
    if (checkUsername.length > 0) {
        return res.json({ msg: "User with this name already exists.", msgType: "error"  });
    }
    try {
        const hashedPassword = await hashPassword(password);
        const newUser = await User.create({
            email: email.toLowerCase(),
            username: username,
            password: hashedPassword,
            created_at: new Date(),
            updated_at: new Date()
        });
        return res.json({ msg: "User successfully registered", msgType: "success" });
    } catch (error) {
        return res.json({ msg: error.message, msgType: "error"  });
    }
});

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10)
    return hashedPassword
}

async function checkPassword(password, hashedPassword) {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
}

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ msg: "Email and password are required.", msgType: "error" });
    }
    const user = await User.where("email").equals(email.toLowerCase());
    if (user.length > 0) {
        const checkedPass = await checkPassword(password, user[0].password);
        if (checkedPass) {
            return res.json({ msg: "Login successful!", msgType: "success"});
        }
    }
    return res.json({ msg: "Invalid email or password.", msgType: "error" });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});