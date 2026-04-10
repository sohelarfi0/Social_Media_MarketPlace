import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Marketplace from './pages/Marketplace.jsx'
import ListingDetails from './pages/ListingDetails.jsx'
import MyListings from './pages/MyListings.jsx'
import ManageListings from './pages/ManageListings.jsx'
import MyOrders from './pages/MyOrders.jsx'
import Messages from './pages/Messages.jsx'
import Loading from './pages/Loading.jsx'




const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/my-listings" element={<MyListings />} />
        <Route path="/listings/:listingId" element={<ListingDetails />} />
        <Route path="/create-listings" element={<ManageListings />} />
        <Route path="/edit-listings/:id" element={<ManageListings />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/loading" element={<Loading />} />
      </Routes>
    </div>
  )
}

export default App