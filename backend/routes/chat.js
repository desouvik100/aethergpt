import {randomUUID} from "node:crypto";
import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/openai.js";

const router = express.Router();

router.post("/test", async(req, res) => {
    try{
        const thread = new Thread({
            threadId: randomUUID(),
            title: "New thread test"
        });

        const response = await thread.save();
        res.send(response);
    }
    catch(error){
        console.log(error);

        res.status(500).json({
            success: false,
            message: `Failed due to error ${error.message}`
        })
    }
})

router.get("/thread", async(req, res) => {
    try{
        const threads = await Thread.find({}).sort({updatedAt: -1});

        res.status(200).json({
            success: true, 
            message: "Threads are fetched successfully",
            data: threads
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})


router.get("/thread/:threadId", async(req, res) => {

    const {threadId} = req.params;

    try{
        const thread = await Thread.findOne({threadId});

        if(!thread){
            return res.status(404).json({
                success: false,
                message: "No thread found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Chat fetched successfully",
            data: thread
        })
    }

    catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

router.delete("/thread/:threadId", async(req, res) => {
    
    const {threadId} = req.params;

    try{
        if(!threadId){
            return res.json({message: "No thread found"});
        }

        const deletedThread = await Thread.findOneAndDelete({threadId});

        if (!deletedThread) {
            return res.status(403).json({
                success: false,
                message: "Could not deleted"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Thread successfully deleted",
            data: deletedThread
        })
    }

    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

router.post("/chat", async(req, res) => {
    let {threadId, message} = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({
            success: false,
            message: "message is required"
        })
    }

    if (!threadId) {
        threadId = randomUUID();
    }

    try{
        let thread = await Thread.findOne({threadId});

        if(!thread){
            thread = new Thread({
                threadId,
                title: message,
                messages:[{role: "user", content: message}]
            })
        }
        else{
            thread.messages.push({role: "user", content: message});
        }

        const conversationHistory = thread.messages.map((msg) => {
        return {
            role: msg.role,
            content: msg.content
        };
        });

        console.log("Conversation history:", JSON.stringify(conversationHistory, null, 2));

        const assistantReply = await getGeminiAPIResponse(conversationHistory);
        //     thread.messages.map((msg) => {
        //     return{
        //     role: msg.role,
        //     content: msg.content
        //     }
        // })


        console.log("Assistant reply: ", assistantReply);

        thread.messages.push({role: "assistant", content: assistantReply});

        thread.updatedAt = new Date();

        await thread.save();

        return res.status(200).json({
            success: true,
            threadId: thread.threadId,
            reply: assistantReply
        })
    }
    catch(error){

        console.log("chat route error", error);

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

export default router;