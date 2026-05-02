// require('dorenv').config({path: './env'}) -- WAY-1
import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config({
    path: "./env"
})

connectDB()









/* approach - 1
import express from 'express'
const app = express();

( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    } catch (error) {
        console.error("ERROR: ",error) //console.log() can also be used :)
    }
})()
*/

