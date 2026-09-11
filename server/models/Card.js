
import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
    title:{type:String , require:true},
    description:{type:String , default:''},
    list:{type:mongoose.Schema.Types.ObjectId , ref:'List' , require:true},
    order:{type:Number , require:true},
    dueDate:{type:Date},
    assignee:{type:mongoose.Schema.Types.ObjectId , ref:'User' , require:true},
},{timestamps:true});

export default mongoose.model('Card' , cardSchema);
