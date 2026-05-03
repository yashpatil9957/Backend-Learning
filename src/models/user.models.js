import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema ({
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true  //used for searching data in database in optimal way!
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true  //used for searching data in database in optimal way!
    },
    avatar:{
        type: String,   //cloudinary url
        required: true,
    },
    coverImage:{
        type: String,   //cloudinary url
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password:{
        type: String,
        required: [true, "password is required"]   //true value ke sath msg de sakte
    },
    refreshToken:{
        type: String
    }
},{timestamps: true})

userSchema.pre("save", async function (next) {
    if(!this.modified("password")) return next();   //->this condition helps in avoiding the recursive execution of 'password encryption' after change in any field userSchema! 

    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this.id,

            //FOLLOWING LINES WE DONT WANT TO BE REFRESH AGAIN AND AGAIN - HENCE WE DON'T WRITE THEM HERE!!!

            // email: this.email,
            // username: this.username,
            // fullName: this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', 'userSchema')