// how findByIdAndUpdate works = { id , updated List }


import express from "express"
import List from "../models/List.js"
import Board from "../models/Board.js"

import authMiddleware from '../middleware/authMiddleware.js';
import mongoose from "mongoose";

const router = express.Router();
router.use(authMiddleware);

// create list within board

router.post('/' , async (req , res) =>{
    try{
        const {title , boardId } = req.body;
        // verify the board members
        const board = await Board.findOne({_id:boardId , members:req.userId});

        if(!board){
            return res.status(404).json({
                message:'Board not found or not authorized'
            });
        }
        // Find current max order for this board's lists
        const lastList = await List.findOne({board:boardId}).sort({order: -1});
        const order = lastList ? lastList.order + 1  : 0;

        const list = await List.create({
            title,
            board:boardId,
            order
        });
        res.status(201).json(list);
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

// get all list for board

router.get('/board/:boardId' , async (req , res) => {
    try{
        const board = await Board.findOne({_id:req.params.boardId , members:req.userId});

        if(!board){
            return res.status(404).json({
                message:"Board not found Or not authorized"
            });
        }

        const lists = await List.find({board :req.params.boardId}).sort({order:1});
        res.json(lists);
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

// update list title

router.put('/:id' , async (req , res)=> {
    try{
        const { title } = req.body;
        const list = await List.findByIdAndUpdate(
            req.params.id ,
             { title } ,
             { new :true

             });
        if(!list){
            return res.status(404).json({
                message:"List not found"
            });
        }
        res.json(list);
    } catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

// UPDATE list order (for drag-and-drop reordering)

router.put('/:id/reorder' , async (req , res)=>{
    try{
        const { order } = req.body;
        const list = await List.findByIdAndUpdate(req.params.id , { order } , {new:true});
        if(!list){
            return res.status(404).json({
                message:'List not found'
            });
        }
        res.json(list);
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

// Delete a list

router.delete('/:id' , async (req , res) =>{
    try{
        const list = await List.findByIdAndDelete(req.params.id);
        if(!list){
            return res.status(404).json({
                message:"List not found"
            })
        }
        res.json({
            message:"list deleted"
        })
    }catch(err){
        res.status(500).json({
            message:err.message
        })
    }
});

export default router;
