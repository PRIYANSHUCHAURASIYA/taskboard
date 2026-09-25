// why (mongoose.Schema.Types.ObjectId )code of block used
// because mongoDB generate random user id. ie=  "68a123456789..."

// 2nd => use of owner & members in database
// owner is used in single user
// members for multiple users

import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
    // for title of board
    title:{
        type:String,
        required:true
    },
    owner:{
        type : mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }],
},{timestamps:true});

export default mongoose.model('Board' , boardSchema);
