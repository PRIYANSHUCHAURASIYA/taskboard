import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema({
    text:{type:String ,require:true},
    card:{type:mongoose.Schema.Types.ObjectId , ref:"Card" , require:true},
    author:{type:mongoose.Schema.Types.ObjectId , ref:"User" , require:true},
} , { timestamps:true});

export default mongoose.model("Comment" , commentSchema);
