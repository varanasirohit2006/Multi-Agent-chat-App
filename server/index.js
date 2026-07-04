import express from "express";
import connectDb from "./config/connectDb.js";
import dotenv from 'dotenv';
import cors from 'cors';
import authrouter from "./routers/authrouter.js";
import chatRouter from "./routers/chatrouter.js";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json())
app.use('/api', authrouter);
app.use('/api', chatRouter);

const PORT = process.env.PORT || 5000;

await connectDb();



app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})  