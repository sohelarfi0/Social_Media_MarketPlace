export const  protect = async (req , res , next)=>{
    try{
        const {userId, has} = await req.auth();
        const hasPremiumPlan = await has({plan: 'premium'});
        req.plan = hasPremiumPlan ? 'premium' : 'free';
        return next()

        
    }
    catch(error)
    {
        console.log(error);
        res.status(401).json({message:error.code || error.message});
    }
}


export const  protectAdmin = async (req , res , next)=>{
    try{
        const {userId, has} = await req.auth();
        const adminEmails = process.env.ADMIN_EMAIL?.split(",") || [];
        
        if(!adminEmails.includes(userId)){
            return res.status(401).json({message:"Unauthorized - Admin access required"})
        }
        return next()

    }
    catch(error)
    {
        console.log(error);
        res.status(401).json({message:error.code || error.message});
    }
}