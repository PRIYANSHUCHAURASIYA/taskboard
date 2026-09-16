// add comment on the card

import express from "express";
import Comment from "../models/Comment.js";
import Card from "../models/Card.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);
// get all comment for a card

router.get("/card/:cardId" , async (req , res ) =>{
    try{
        const comments = await Comment.find({ card : req.params.cardId})
            .populate("author" , "name email")
            .sort({ createdAt: 1 });
        res.json(comments);
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

router.post("/" , async (req , res) =>{
    try{
        const { text , cardId } = req.body;
        const card = await Card.findById(cardId);
        if(!card){
            return res.status(404).json({
                message: "Card not found"
            })
        }

        const comment = await Comment.create({
            text ,
            card:cardId,
            author:req.userId,
        });

        const populated = await comment.populate("author" , "name email");
        res.status(201).json(populated);
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

// delete a comment (only the author can delete)

router.delete("/:id" , async(req , res) =>{
    try{
        const comment = await Comment.findOne({ _id:req.params.id  , author:req.userId });
        if(!comment){
            return res.status(404).json({
                message:"Comment not found or not authorized"
            });
        }
        await comment.deleteOne();
        res.json({
            message:"Comment Deleted"
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }

});

export default router;
