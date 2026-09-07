import express from 'express'
import Card from '../models/Card.js';
import List from '../models/List.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// Create the card within list
router.post('/' , async (req , res) =>{
    try{
        const { title , description , listId , dueDate , assignee } = req.body;

        const list = await List.findById(listId);
        if(!listId){
            return res.status(404).json({
                message:'List not found'
            });
        }
        const lastCard = await Card.findOne({list:listId}).sort({order:-1});
        const order = lastCard ? lastCard + 1 : 0; // ordering from decending order

        const card = await Card.create({title , description , list : listId , order , dueDate , assignee});

        res.status(201).json(card);
    }catch(err){
        res.status(500).json({
            message : err.message
        });
    }
});

// get all the  card

router.get('/list/:listId' , async (req , res) =>{
    try{
        // starting list show karega
        const cards = await Card.find({list:req.params.listId}).sort({order:1});
        res.json(cards);
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

// UPDATE a card (title, description, dueDate, assignee)

router.put('/:id' , async (req,res) =>{
    try{
        const update = req.body;
        const card = await findByIdAndUpdate(req.params.id , update ,{new:true});
        if(!card){
            return res.status(404).json({
                message:"Card not found"
            });
        }
        res.json(card);
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

// MOVE a card (change list and/or order) — this is the key one for drag-and-drop
router.put('/:id/move' , async (req,res) =>{
    try{
        const { listId , order } = req.body;
        const card = await Card.findByIdAndUpdate(
            req.params.id,
            {list: listId , order},
            {new : true}
        );

        if(!card){
            return res.status(404).json({
                message:'Card not found'
            });
        }
        res.json(card);
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

// Delete a card

router.delete('/:id' , async (req , res) =>{
    try{
        const card = await Card.findByIdAndDelete(req.params.id);
        if(!card){
            return res.status(404).json({
                message:'Card not found'
            });
        }
        res.json({
            message:'Card deleted'
        });
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

export default router;
