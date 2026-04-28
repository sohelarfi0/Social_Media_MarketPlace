import imagekit from '../configs/imageKit.js';
import prisma from '../configs/prisma.js';
import fs from 'fs';


// controller function for adding listing to database

export const addListing = async (req, res)=>{
    try{
        const {userId} = await req.auth();
        if(req.plan != "premium"){
            const listingCount = await prisma.listing.count({
                where: {ownerId: userId}
            })
            if(listingCount >= 5){
                return res.status(400).json({ message: "you have reached the free listing limit " });

            }
        }

        const accountDetails = JSON.perse(req.body.accountDetails)

        accountDetails.followers_count = parseFloat(accountDetails.followers_count)
        accountDetails.engagement_rate = parseFloat(accountDetails.engagement_rate)
        accountDetails.monthly_views = parseFloat(accountDetails.monthly_views)
        accountDetails.price = parseFloat(accountDetails.price)
        accountDetails.platform = accountDetails.platform.toLowerCase();
        accountDetails.niche = accountDetails.niche.toLowerCase();



        accountDetails.username.startsWith("@") ? accountDetails.username = 
        accountDetails.username.slice(1) : null

    
        const uploadImages = req.files.map(async(file)=>{
            const response = await imagekit.files.upload({
                file:FileSystem.createReadStream('file.path'),
                fileName: `${Date.now()}.jpg`,
                folder: "flip-earn",
                transformation:{pre:"w-1280, h-auto"}
            });
            return response.url

        })

        // wait for all uploads to complete
        const images = await Promise.all(uploadImages);

        const listing = await prisma.listing.create({
            data: {
                ownerId:userId,
                images,
                ...accountDetails
            }
        })

        return res.status(201).json({message: "Account Listed successfully",listing});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:error.code || error.message})


    }
}



// controller for getting all public listing
export const getAllPublicListing = async (req, res)=>{
    try{

        const lisitngs = await prisma.listing.findMany({
            where: {status: "active"},
            include: {owner:true},
            orderBy: {createdAt:"desc"},
        })

        if(!lisitngs || lisitngs === 0){
            return res.json({lisitngs: []});

        }
        return res.json({lisitngs});

    }
    
    catch(error){
        console.log(error);
        res.status(500).json({message:error.code || error.message})
    }
}

// controller for getting all user listing
export const getAllUserListing = async (req, res)=>{
    try{
        const {userId} = await req.auth();
        // get all listings except deleted
        const listings = await prisma.listing.findMany({
            where: {ownerId:userId, status: {not: "deleted"}},
            orderBy: { createdAt: "desc"},

        })

        const user = await prisma.user.findUnique({
            where: {id: userId}
        })

        const balance = {
            earned: user.earned,
            withdrawn: user.withdrawn,
            available: user.earned - user.withdrawn,
        }
        if(!listings || listings.length === 0){
            return res.json({listings: [], balance});
        }

        return res.json({listings, balance});

    }catch(error){
        console.log(error);
        res.status(500).json({message:error.code || error.message})
        

    }
}
 
// controller for updating listing in database

export const updateListing = async (req, res)=>{
    try{
        const {userId} = await req.auth();
        const accountDetails = JSON.parse(req.body.accountDetails)

        if(req.files.length + accountDetails.images.length > 5){
            return res.status(400).json({message:"You can only upload up to 5 images"});

        }

         accountDetails.followers_count = parseFloat(accountDetails.followers_count)
        accountDetails.engagement_rate = parseFloat(accountDetails.engagement_rate)
        accountDetails.monthly_views = parseFloat(accountDetails.monthly_views)
        accountDetails.price = parseFloat(accountDetails.price)
        accountDetails.platform = accountDetails.platform.toLowerCase();
        accountDetails.niche = accountDetails.niche.toLowerCase();



        accountDetails.username.startsWith("@") ? accountDetails.username = 
        accountDetails.username.slice(1) : null


        const listing = await prisma.listing.update({
            where: {id:accountDetails.id, ownerId:userId},
            data: accountDetails
        })

        if(!listing){
            return res.status(400).json({message: "Listing not found"});

        }

        if(listing.status === "sold"){
            return res.status(400).json({ message: "you can not update sold listing"});


        }

        if(req.files.length > 0){
            const uploadImages = req.files.map(async(file)=>{
            const response = await imagekit.files.upload({
                file:FileSystem.createReadStream('file.path'),
                fileName: `${Date.now()}.jpg`,
                folder: "flip-earn",
                transformation:{pre:"w-1280, h-auto"}
            });
            return response.url

        })

        // wait for all uploads to complete
        const images = await Promise.all(uploadImages);

        const listings = await prisma.listing.update({
            where: {is: accountDetails.id, ownerId: userId},
            data: {
                ownerId: userId,
                ...accountDetails,
                images:[...accountDetails, ...images]
            }

        })
        return res.json({message: "Account updated successfully", listing});

        }
        return res.json({message: "Account updated successfully", listing});


    }catch(error){
        console.log(error);
        res.status(500).json({message:error.code || error.message})
        

    }

    
}



export const toggleStatus = async (req, res)=>{
    try{
        const {id} = req.params;
        const {userId} = await req.auth();

        const listing = await prisma.listing.findUnique({
            where: {id, ownerId:userId},
        })
        if(!listing){
            return res.status(404).json({message:"Listing not found"});

        }
        if(listing.status === "active" || listing.status === "inactive"){
            await prisma.listing.update({
                where: {id, ownerId:userId},
                data: {status: listing.status === "active" ? "inactive" : "active"}
            })
        }else if(listing.status === "ban"){
            return res.status(400).json({message: "Your listing is banned"});

        }
        



    }catch(error){
        console.log(error);
        res.status(500).json({message:error.code || error.message})
        

    }
}