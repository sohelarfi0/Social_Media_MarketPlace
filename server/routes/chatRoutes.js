import express from 'express';
import {protect} from "../middlewares/authMiddleware.js"
import { getAllUserChats, sendChatMessage } from '../controllers/chatController';



const chatRouter = express.Router()

chatRouter.post("/",protect , getChat)
chatRouter.geett("/user",protect, getAllUserChats)
chatRouter.post("/send-message", protect, sendChatMessage)


export default chatRouter