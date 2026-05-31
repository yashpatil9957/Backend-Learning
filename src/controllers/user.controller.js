import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
//This 'User' can contact with mongodb as much as we want
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

//Access and Refresh tokens - ek method bana lete h kyun ki baar use hoga!!
const generateAccessandRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh tokens")
    }
}


const registerUser = asyncHandler( async (req, res) => {
    /*
    1.get user details from frontend
    2.validations
    3.check if user is already registered or not?
    4.check for images, also specifically check for avatar!!
    5.upload them to cloudinary, check for avatar - nhi toh db phatega!!
    6.create User object - create entry in db
    7.remove password and refresh tokens
    8.check for user creation
    9.return response 
    */

    // get user details from frontend
    const {fullName, email, username, password} = req.body
    console.log("email", email)

    // validations on fields
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if user is already registered or not?
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser) {
        throw new ApiError(409, "User with this email or username already exists!")
    }

    // check for images, also specifically check for avatar!!
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

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
        throw new ApiError(500, "something went wrong while registering the user!")
    }

    //return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler( async (req, res) => {
    /*
        
        algorithm
        1.req body -> data
        2.login - username / email
        3.find the user
        4.password check
        5.access and refresh token
        6.send cookies 
    */

    //data from req.body
    const {email, username, password} = req.body

    //login - email, username
    if(!username || !email) {
        throw new ApiError(400, "username or email is required!")
    }

    //finding the user
    //Login only through either email or username -> User.findOne({email}) / User.findOne({username})

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "user does not exist!")
    }

    //password checking
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(404, "Invalid user credentials")
    }

    //access and refresh tokens - method bana liya kyunki baar baar generate karenge!!
    const {accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id)

    //cookies

    /*IMP--question rises - Should I call one more query or just update prev query depending on complexity at that time!!
    This question rised because - 'user' don't have instance of acess and refresh tokens as 'user' was fromed before generating access and refresh tokens 
    */

    const loggedInUser = User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("acessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req, res) => {
    /*algorithm
    1.clear cookies
    
    */
})

export {registerUser, loginUser}