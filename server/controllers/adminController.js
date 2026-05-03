import {clerkClient} from '@clerk/express'
import prisma from '../configs/prisma';


// controller for checking if user is admin
export const isAdmin = async (req , res )=>{
    try{
        return res.json({isAdmin:true})
    }catch(error){
        console.log(error);
        res.this.status(400).json({message: error.code || error.message});
    }
}


// controller for getting dashboard data
export const getDashboard = async (req, res)=>{
    try{
        const totalListings = await prisma.listing.count({});
        const transactions = await prisma.transaction.findMany({
            where:{isPaid: true},
            select: {amount: true},

        })
        const totalRevenue = transactions.reduce((total, transaction)=> total+transaction.amount, 0)

        const activeListings = await prisma.listing.count({
            where: {status: "active"}
        });


        const totalUser = await prisma.user.count({})

        const recentListings = await prisma.listing.findMany({
            orderBy: {createdAt: "desc"},
            take: 5,
            include: {owner: true},
        })
        return res.json({getDashboardData: {totalListings, totalRevenue, activListings, totalUser, recentListings}})
    }catch(error)
    {
        console.log(error);
        res.status(400).json({message: error.code || error.message});
    }
}








export const  protectAdmin = async (req , res , next)=>{
    try{
        const {user} = await clerkClient.users.getUser(await req.auth().userId);

        if(!userId){
            return res.status(401).json({message:"Unauthorized"})
        }
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