// # CREATING A WRAPPER !!!!

//way-1
const asyncHandler = (requestHandler) => {
    (req, rea, next) => {
        Promise.resolve(requestHandler(req. res, next))
        .catch((err) => next(err))
    } 
}





export {asyncHandler}

//way-2
/*const asyncHandler = (fn) => async (req, res, next) => {
    try{
        await fn(req, res, next)

    }catch(error){
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })

    }

}*/

