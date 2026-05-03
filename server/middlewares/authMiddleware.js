export const  protect = async (req , res , next)=>{
    try{
        const {userId, has} = await req.auth();
        const isAdmin = process.env.ADMIN_EMAILD.split(",").includes(userId.emailAddresses[0].emailAddress);

        if(!isAdmin){
            return res.status(401).json({message: "Unauthorized"});
        }
        return next()

        
    }
    catch(error)
    {
        console.log(error);
        res.status(401).json({message:error.code || error.message});
    }
}