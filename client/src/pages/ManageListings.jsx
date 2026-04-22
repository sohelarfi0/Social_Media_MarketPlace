import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import {toast}  from 'react-router-dom'
const ManageListings = () => {
  const {id} = useParams()
  const navigate = useNavigate()
  const {userListings} = useSelector((state)=>state.listing)
  const [loadingListing, setLoadingListing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFromData] = useState({
       title: '',
       platform: '',
       username: '',
       folloers_count:'',
       engagement_rate:'',
       monthly_views:'',
       niche:'',
       price:'',
       description:'',
       verified:false,
       monetized: false,
       country:'',
       age_range:'',
       images: [],
  })

  const platforms = ['youtube','instagram', 'tiktok','facebook', 'twitter',
    'linkedin', 'pinterest', 'snapchat','twitch', 'discord'
  ];
  
  const niches = ['lifestyle', 'fitness','food', 
    'traavel','tech','gaming','fashion','beauty','business','education','enterainment',
     'music','sports','health','finance','Mixed ages'];

  const ageRanges = ['13-17 years', '18-24 years', '25- 34 years', 
    '35- 44 years', '45-54 years','55+ years', 'Mixed ages'];



  const handleInputChange = (field, value)=>{
    setFromData((prev)=>({...prev, [field]:value}));

  }

  const handleImageUpload = async(event)=>{
    const files= Array.form(event.target.files);
    if(!files.length) return ;
    if(files.length + formData.images.length > 5) return toast.error("You can add up to 5 images")

    setFromData((prev)=>({...prev, images:[...prev.images, ...files]}))


  }

  const removeImage =(indextoRemove) =>{
    setFromData((prev)=>({
      ...prev, images:prev.images.filter((_,i)=> i !== indextoRemove)
    }))
  }


//  get listing data for edit if 'id' 

  return (
    <div></div>
  )
}

export default ManageListings