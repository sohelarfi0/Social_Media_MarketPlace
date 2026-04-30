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

        }else if(listing.status === "sold"){
            return res.status(400).json({message: "Your listing is sold"});
        }

        return res.json({message: "Listing status updated successfully", listing});
        



    }catch(error){
        console.log(error);
        res.status(500).json({message:error.code || error.message})
        

    }
}


export const deleteUserListing = async (req, res)=>{
    try{
        const {userId} = await req.auth();
        const {listingId} = req.params;

        const listing = await prisma.listing.findFirst({
            where: {id: listingId, ownerId: userId},
            include: {owner: true}
        })
        if(!listing){
            return res.status(404).json({message:"Listing not found"});
        }
        if(listing.status === "sold"){
            return res.status(400).json({message: "sold listing can't be deleted"});
        }
        // if password has been changed, send the new password to the owner 
        if(listing.isCredentialChanged){
            // send email to owner
        }
        await prisma.listing.update({
            where:{id:listingId},
            data:{status: "deleted"}
        })

        return res.json({message: "Listing deleted successfully" });
    }catch(error){
        console.log(error);
        res.status(500).json({message:error.code || error.message})
        

    }
}



export const addCredential = async (req, res)=>{
    try{
        const  {userId} = await req.auth();
        const {listingId, credential } = req.body;

        if(credential.length === 0 || !lisitngId){
            return res.status(400).json({message: "Missing Fields"});
        }

        const listing = await prisma.listing.findFirst({
            where: {id: listingId, ownerId:userId},
        })

        if(!listing){
            return res.status(400).json({message: "Lisitng not found or you are not the owner"});
        }

        await prisma.credential.create({
            data:{
                lisitngId,
                originalCredential: credential
            }
        })

        await prisma.lisitng.update({
            where: {id:listingId},
            data:{isCredentialSubmitted: true}
        })
        
        return res.json({message: "Credential added successfully"});
    }catch(error){
        console.log(error);
        res.status(500).json({message:error.code || error.message});
        

    }
}


export const markFeatured = async (req, res)=>{
    try{
        const {id} = req.params;
        const {userId} = await req.auth();

        if(req.plan !== "premium"){
            return res.status(400).json({message: "Premium plan required"});

        }
        // unset all other featured listings
        await prisma.listing.updateMany({
            where: {ownerId: userId},
            data:{featured: false},
        })
        // Mark the listing as featured
        await prisma.listing.updateMany({
            where: {id},
            data: {featured: true},
        })
        return res.json({message:"Listing marked as featured"});
    }catch(error){
        console.log(error);
        res.status(500).json({message:error.code || error.message})
        

    }
}



export const getAllUserOrders = async (req, res) =>{
    try{
        const {userId} = await req.auth();
        let orders = await prisma.transaction.findMany({
            where: {userId, isPaid: true},
            include: {listing:true},
        })
        if(!orders || orders.length === 0){
            return res.json({orders:[]});
        }
        // Attach the credential to each order
        const credentials = await prisma.credential.findMany({
            where: {listingId: {in: orders.map((order)=>order.listingId)}}
        })
        const ordersWithCredentials = orders.map((order)=>{
            const credential = credentials.find((cred)=> cred.listingId === order.listingId)
            return {...order,credential }
        })
        return res.json({orders: ordersWithCredentials});



    }catch(error){
        console.log(error);
        res.status(500).json({message:error.code || error.message})
        

    }
}

export const withdrwanAmount = async (req, res)=>{
    try{
        const {userId} = await req.auth();
        const {amount, account} = req.body;

        const user = await prisma.user.findUnique({where: {id:userId}})

        const balance = user.earned - user.withdrawn

        if(amount > balance){
            return res.status(400).json({message: "Insufficient balance"});
        }

        const withdrawal = await prisma.withdrawal.create({
            data: {
                userId, amount, account
            }
        })

        await prisma.user.update({
            where:{id:userId},
            data:{withdrawn:{increment:amount}}
        })
        return res.json({message:"Applied for withdrawal", withdrawal});


    }catch(error){
        console.log(error);
        res.status(500).json({message:error.code || error.message})
        

    }
}


export const purchaseAccount = async (req, res)=>{
    
}