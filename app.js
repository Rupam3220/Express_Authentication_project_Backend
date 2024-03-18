//dotenv import and config
import dotenv from 'dotenv'
dotenv.config()

//import express
import express from 'express'

//import CORS policy
import cors from 'cors'

//import mongoDB
import connectDB from './config/connectdb.js'

import userRoutes from './routes/userRoutes.js'

//app, port, db  declaration
const app = express()
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

//CORS Policy
app.use(cors())

//DB  connection
connectDB(DATABASE_URL)

//JSON declaration
app.use(express.json())

//load router
app.use("/api/user", userRoutes)

//web server
app.listen(port, () => {
    console.log(`server running at port: ${port}`)
})
