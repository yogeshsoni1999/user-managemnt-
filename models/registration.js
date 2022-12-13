const mongoose =require('mongoose');


const regSchema =mongoose.Schema({
    username:String,
    password:String,
    firstname:String,
    lastname:String,
    email:String,
    status:String,
    role:String,
    profileimg:String
});


module.exports =mongoose.model('userReg',regSchema);