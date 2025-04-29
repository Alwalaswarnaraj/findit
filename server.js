import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import connectDB from './config/db.js';
import userRouter from './routes/userRoutes.js';

import lostItemRouter from './routes/lostItemsRoutes.js'
import foundItemRouter from './routes/foundItemRoutes.js'

config(); //loads environmental variables

const app = express()


app.use(cors())
app.use(json())


app.get('/', (req, res)=>{
    res.send('find it backend running');
})



// database connection
connectDB(process.env.MONGO_URI)

// Use user routes for any requests starting with /api/users
app.use('/api/users', userRouter);
app.use('/api/found', foundItemRouter);
app.use('/api/lost', lostItemRouter)

// start server``
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`server is listening on ${PORT}`)
})