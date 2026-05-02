import express from "express"
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"          //object ke andar object de sakte ho!!
}))

app.use(express.static("public"))       //because of 'public' folder 

app.use(cookieParser())

export {app}