const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
    name:{type: String, required: true},
    email:{type: String, required: true},
    isAdmin:{type: Boolean, required: false, default:false},
    authentication:{
        password:{type: String, required: true, select: false},
        salt:{type: String, select: false},
        sessionToken:{type:String, select:false},
    },
});

const userModel = mongoose.model("users",userSchema);

const getUserByEmail = (email) => userModel.findOne({email:email});
const updateSessionToken = (email) => userModel.findOneAndUpdate({email:email},{"authentication.sessionToken":""});

module.exports = {
    getUserByEmail,
    updateSessionToken,
}