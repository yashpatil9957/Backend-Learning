import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
//middleware
import { upload } from "../middlewares/multer.middleware.js"    

const router = Router()

router.route('/register').post(
    //This is our MIDDLEWARE - upload for avatar and coverimage - for file handling.
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)


export default router