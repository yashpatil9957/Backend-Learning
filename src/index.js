// require('dorenv').config({path: './env'}) -- WAY-1
import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config({
    path: "./env"
})

connectDB()
.then(() => {
    // app.on("error", (err) => {
    //     console.log("ERROR :", err);
    //     throw error;
    // })

    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGOdb connection failed !!!", err);
})









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

