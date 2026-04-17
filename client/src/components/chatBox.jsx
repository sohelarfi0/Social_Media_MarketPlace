import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { dummyChats } from '../assets/assets';
import { X } from 'lucide-react';
import { clearChat } from '../app/features/chatSlice';

const ChatBox = () => {
    const {listing, isOpen, chatId} = useSelector((state)=>state.chat)

    const user = {id: ' user_2'};

    const dispatch = useDispatch();

    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const fetchChat = async ()=>{
        setChat(dummyChats[0]);
        setMessages(dummyChats[0].messages);
        setIsLoading(false)

    }

    useEffect(()=>{
        if(!isOpen){
            setChat(null)
            setMessages([])
            setIsLoading(true)
            setNewMessage("")
            setIsSending(false)
        }
    },[isOpen])

    useEffect(()=>{
        if(listing){
            fetchChat()
        }
    },[listing])

    if(!isOpen || !listing) return null


  return (
    <div className='fixed inset-0 bg-black/70 backdrop-blur bg-opacity-50 z-100 flex items-center justify-center sm:p-4'>

        <div className='bg-white sm:rounded-lg shadow-2xl w-full max-w-2xl h-screen sm:h-[600px] flex flex-col'>
        {/* header */}
        <div className='bg-gradient-to-r from-indigo-600 to-indigo-400 text-white p-4 sm:rounded-t-lg flex items-center justify-between'>
            <div className='flex-1 min-w-0'>
                <h3 className='font-semibold text-lg truncate'>{listing?.title}</h3>
                <p className='text-sm text-indigo-100 truncate'>{user.id === 
                    listing?.ownerId? `Chatting with buyer (${chat?.chatUser?.name || 'Loading...'})` : `Chatting with seller (${chat?.ownerUser?.name || 'Loading...'})`}</p>


            </div>
            <button onClick={()=> dispatch(clearChat())}
            className='ml-4 p-1 hover:bg-white/20 hover:bg-opacity-20 rounded-lg transition-colors'>
            <X className='w-5 h-5' />
            </button>
        </div>
        </div>

        {/* Messages Area */}
        <div className=' flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100'>
            {isLoading ?
            (
                <div className='flex items-center justify-center h-full'>
                    <div className='text-center'>
                        <p className='text-gray-500 mb-2'>No messages yet</p>
                        <p className='text-sm text-gray-400'>Start the conversation!</p>
                    </div>
                </div>
            ):
            (
               messages.map((message)=>(
                <div key={message.id} className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 pb-1 ${message.sender_id === user.id ? "bg-indigo-600 text-white" : 
                        "bg-white border border-gray-200 text-gray-800"
                    }`}>
                        <p className='text-sm break-words whitespace-pre-wrap'>
                            {message.message}
                        </p>
                        <p className={`text-[10px] mt-1 ${message.sender_id === user.id ? "text-indigo-200" : "text-gray-400"}`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
               ))
            )}
        </div>

    </div>
  )
}

export default ChatBox