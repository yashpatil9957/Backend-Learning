import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
//This 'User' can contact with mongodb as much as we want
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req, res) => {
    /*
        
    */

    // get user details from frontend
    const {fullName, email, username, password} = req.body
    console.log("email", email)

    // validations
    if(
        [fullName, email, username, password].some((superman) => superman?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if user is already registered or not?
    const existedUser = User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser) {
        throw new ApiError(409, "User with this email or username already exists!")
    }

    // check for images, also specifically check for avatar!!
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required!")
    }

    //upload them to cloudinary, check for avatar - nhi toh db phatega!!
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar not uploaded!")
    }

    //create User object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //remove password and refresh tokens
    const createdUser = await User.findById(user._id).select(
        //jo nhi chaiye woh minus(-) karo
        "-password -refreshToken"
    )

    //check for user creation
    if (!createdUser) {
        throw new ApiError(500, "sommething went wrong while registering the user!")
    }

    //return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})


export {registerUser}