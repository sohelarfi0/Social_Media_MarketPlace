import { ChevronDown, Filter, X } from 'lucide-react'
import React  from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'

const FilterSidebar = ({showFilterPhone, setShowFilterPhone, filters, setFilters}) => {


    const currency = import.meta.env.VITE_CURRENCY || '$';
    const navigate =useNavigate()
    const [searchParams, setSearchParams] =useSearchParams()
    const [search, setSearch] = useState(searchParams.get('search') || '')

    const onChangeSeaarch =(e)=>{
        if(e.target.value){
            setSearchParams({search: e.target.value})
            setSearch(e.target.value)
        }
        else{
            navigate(`/marketplace`)
            setSearch('')
        }
    }

    const [expandedSections, setExpandedSections] = useState({
        platform: true,
        price:true,
        followers:true,
        niche: true,
        status: true,
    })

    const toggleSection = (section)=>{
        setExpandedSections((prev)=>({...prev, [section]: !prev[section]}))

    }

    const onFiltersChange = (newFilters)=>{
        setFilters(newFilters)
    }

    const onClearFilters =()=>{
        if(search){
            navigate("/marketplace")
        }
        setFilters({
            platforms: null,
            maxPrice: null,
            minFollowers: null,
            niche: null,
            verified: false,
            monetized: false,
        })
    }

    const platforms = [
        {value: 'youtube', label: 'YouTube'},
        {value: 'instagram', label: 'Instagram'},
        {value: 'tiktok', label: 'TikTok'},
        {value: 'twitter', label: 'Twitter'},
        {value: 'facebook', label: 'Facebook'},
        {value: 'twitch', label: 'Twitch'},
        {value:'discord', label: 'Discord'},
    ]


    const niches = [
        {value: 'lifestyle', label: 'Lifestyle'},
        {value: 'gaming', label: 'Gaming'},
        {value: 'beauty', label: 'Beauty'},
        {value: 'fitness', label: 'Fitness'},
        {value: 'travel', label: 'Travel'},
        {value: 'food', label: 'Food'},
        {value:'technology', label: 'Technology'},
        {value:'education', label: 'Education'},
        {value:'finance', label: 'Finance'},
        {value:'health', label: 'Health'},
        {value:'fashion', label: 'Fashion'},
        {value:'music', label: 'Music'},
        {value:'sports', label: 'Sports'},
        {value:'art', label: 'Art'},
        {value: 'entertainment', label: 'Entertainment'},
        {value: 'business', label: 'Business'},
    ]


  return (
    <div className={`${showFilterPhone ? "max-sm:fixed" : "max-sm:hidden"} max-sm:inset-0 z-100 max-sm:h-screen max-sm:overflow-scroll
    bg-white rounded-lg shadow-sm border border-gray-200 h-fit sticky top-24md:min-w-[300px]`}>
<div className='p-4 border-b  border-gray-200'>
    <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2 text-gray-700'>
            <Filter className='size-4'/>
            <h3 className='font-semibold'>Filters</h3>

        </div>
        <div className='flex items-center gap-2'>
            <X  onClick={onClearFilters} className='size-6 text-gray-500 hover:text-gray-700 p-1
            hover:bg-gray-100 rounded transition-colors cursor-pointer'/>
            <button onClick={()=>setShowFilterPhone(false)} className='sm:hidden text-sm border text-gray-700 px-3 py-1 rounded'>
                Apply
            </button>
        </div>


    </div>
</div>

   <div className='p-4 space-y-6 sm:max-h-[calc(100vh)] overflow-y-scroll
   no-scrollbar'>
    <div className='flex items-center justify-between'>
        <input type="text" placeholder='Search by username, platform, niche, etc.'
        className='w-full text-sm px-3 py-2 border
         border-gray-300rounded-md outline-indigo-500' 
         onChange={onChangeSeaarch} value={search}
         />

    </div>
    {/* Platform Filter */}

    <div>
        <button onClick={()=> toggleSection('platform')}
            className='flex items-center justify-between w-full mb-3'>

            <label className='text-sm font-medium text-gray-800'>Platform</label>
            <ChevronDown className={`size-4 transition-transform ${expandedSections.platform ?
                'rotate-180' : ""
            }`}/>
        </button>
        {expandedSections.platform && (
            <div className='flex flex-col gap-2'>
                {platforms.map((platform)=>(
                    <label key={platform.value} className='flex items-center gap-2 text-gray-700 text-sm'>
                       
                        <input type="checkbox"
                         checked={filters.platform?.includes(platform.value) || false }
                         onChange={(e)=>{
                            const checked = e.target.checked;
                            const current = filters.platform || [];
                            const updated = checked ? [...current, 
                                platform.value]: current.filter((p)=> p !== platform.value);
                            
                                onFiltersChange({
                                    ...filters,
                                    platform: updated.length > 0 ? updated : null
                                })


                        }} />
                        <span>{platform.label}</span>
                    </label>
                ))}
            </div>
        )}
    </div>

{/* Price Range */}

    <div>
        <button onClick={()=> toggleSection('price')}
            className='flex items-center justify-between w-full mb-3'>

            <label className='text-sm font-medium text-gray-800'>Price Range</label>
            <ChevronDown className={`size-4 transition-transform ${expandedSections.price ?
                'rotate-180' : ""
            }`}/>
        </button>
        {expandedSections.price && (
            <div className='space-y-3'>
                <input type="range" min="0" max="100000" step="100" value={filters.maxPrice || 100000}
                onChange={(e)=>onFiltersChange({...filters, maxPrice:parseInt(e.target.value)})}
                className='w-full h-2 bg-gray-200 rounded-lg appearance-none
                cursor-pointer accent-indigo-600' />

                <div className='flex items-center justify-between text-sm text-gray-600'>
                    <span>{currency}0</span>
                    <span>{currency}{(filters.maxPrice || 100000).toLocaleString()}</span>
                </div>
               
            </div>
        )}
    </div>

    {/* followers data */}
    <div>
        <button onClick={()=> toggleSection('followers')}
            className='flex items-center justify-between w-full mb-3'>

            <label className='text-sm font-medium text-gray-800'>Minimum Followers</label>
            <ChevronDown className={`size-4 transition-transform ${expandedSections.followers ?
                'rotate-180' : ""
            }`}/>
        </button>
        {expandedSections.followers && (
            <select 
            value={filters.minFollowers?.toString() || "0"}
            onChange={(e)=>onFiltersChange({...filters, minFollowers:parseInt(e.target.value) || 0})}

            
            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 outline-indigo-500'>
                <option value="0">Any Amount</option>
                <option value="1000">1k+</option>
                <option value="10000">10k+</option>
                <option value="100000">100k+</option>
                <option value="500000">500k+</option>
                <option value="1000000">1M+</option> 
            </select>
            
        )}
    </div>
    {/* Niche Filters */}

     <div>
        <button onClick={()=> toggleSection('niche')}
            className='flex items-center justify-between w-full mb-3'>

            <label className='text-sm font-medium text-gray-800'>Niche</label>
            <ChevronDown className={`size-4 transition-transform ${expandedSections.niche ?
                'rotate-180' : ""
            }`}/>
        </button>
        {expandedSections.niche && (
            <select 
            value={filters.niche || ""}
            onChange={(e)=>onFiltersChange({...filters, niche:e.target.value || null})}
            
            
            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 outline-indigo-500'>
               <option value="">All Niches</option> 
               {niches.map((niche)=>(
                <option key={niche.value} value={niche.value}>{niche.label}</option>
               ))}
            </select>
            
        )}
    </div>

    {/* Verification Status */}
    <div>
        <button onClick={()=> toggleSection('status')}
            className='flex items-center justify-between w-full mb-3'>

            <label className='text-sm font-medium text-gray-800'>Account Status</label>
            <ChevronDown className={`size-4 transition-transform ${expandedSections.status ?
                'rotate-180' : ""
            }`}/>
        </button>
        {expandedSections.status && (
            <div className='space-y-3'>
                <label  className='flex items-center space-x-2 cursor-pointer' >
                    <input type="checkbox" checked={filters.verified || false}
                    onChange={(e)=> onFiltersChange({...filters, verified: e.target.checked})}

                     />
                     <span className='text-sm text-gray-700'>Verified accounts only</span>


                </label>

                <label  className='flex items-center space-x-2 cursor-pointer' >
                    <input type="checkbox" checked={filters.monetized || false}
                    onChange={(e)=> onFiltersChange({...filters, monetized: e.target.checked})}

                     />
                     <span className='text-sm text-gray-700'>Monetized accounts only</span>
                     

                </label>

            </div>
           
        )}
    </div>

   </div>
    </div>
  )
}

export default FilterSidebar