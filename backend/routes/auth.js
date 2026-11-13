import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const generateToken = (userId) => {
    return jwt.sign(
        {userId},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );
}

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7*24*60*60*1000,
    path: "/"
}

router.post("/register", async(req, res) => {
    try{
        const {name, email, password} = req.body;

        if(!name.trim() || !email.trim() || !password.trim()){
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Atleast 8 characters password required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({email: normalizedEmail});

        if (existingUser) {
            return res.status(409).json({
            success: false,
            message: "Email is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            authProvider: "local"
        });

        const token = generateToken(user._id);
        
        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });
    }
    catch(error){
        console.error("Registration error:", error);

        return res.status(500).json({
        success: false,
        message: "Registration failed"
        });
    }
})

router.post("/login", async(req, res) => {
    try{
        const {email, password} = req.body;

        if (!email.trim() || !password.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.fineOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user || !user.password) {
            return res.status(401).json({
                sucess: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.passord);

        if (!isMatch) {
            return res.status(401).json({
            success: false,
            message: "Invalid email or password"
            });
        }

        const token = generateToken(user._id);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });
    }
    catch(error){
        console.error("Login error", error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
})

router.get("/me", async(req, res) => {
    try{
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);

        if (!userId) {
            return res.status(401).json({
            success: false,
            message: "User not found"
            });
        }

        return res.status(200).json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        }
      });
    }
    catch(error){
        return res.status(401).json({
        success: false,
        message: "Invalid or expired session"
        });
    }
})

router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/"
    });

     return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
})

export default router;