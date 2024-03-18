import mongoose from "mongoose";

//schema
const userSchema = new mongoose.Schema({
    name: {type:String, required:true, trim:true},
    email: {type:String, required:true, trim:true},
    password: {type:String, required:true, trim:true},
    //password_confirmation: {type:String, required:true, trim:true},
    tc: {type:Boolean, required:true},
})

//model for schema
const UserModel = mongoose.model("user", userSchema)

//exporting model
export default UserModel