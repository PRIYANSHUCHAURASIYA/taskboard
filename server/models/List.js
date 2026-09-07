import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
    title:{type:String , require:true},
    board:{type:mongoose.Schema.Types.ObjectId , ref:'Board', require:true},
    order:{type:Number , require:true}
},{timestamps:true});

export default mongoose.model('List' , listSchema);
