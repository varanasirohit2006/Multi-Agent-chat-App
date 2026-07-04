
import User from '../shemas/user.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config'
import bcrypt from 'bcrypt';


const createjwttoken =  (id) =>{
    return  jwt.sign({id},process.env.JWT_KEY,{expiresIn:"30d"});
}



export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Fields need to be filled! Incomplete data to register" });
    }

    try {
        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Just pass the plain password here! Your Mongoose hook will securely hash it.
        const user = await User.create({ name, email, password });

        const token = createjwttoken(user._id);

        return res.status(201).json({
            email: user.email,
            name: user.name,
            token
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "fill the input fields" });
    }

    const usermodel = await User.findOne({ email });

    if (!usermodel) {
        return res.status(400).json({ message: "no user found in db" });
    }

    const isCorrectPassword = await bcrypt.compare(password, usermodel.password);

    if (isCorrectPassword) {
        const token = createjwttoken(usermodel._id);
        return res.status(200).json({
            email: usermodel.email,
            name: usermodel.name,
            token
        });
    }

    return res.status(400).json({ message: "password or email are invalid" });
};

export const getMe = async (req, res) => {
    return res.status(200).json({
        email: req.user.email,
        name: req.user.name,
    });
};