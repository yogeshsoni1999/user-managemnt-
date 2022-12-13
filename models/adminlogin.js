const mongoose =require('mongoose')


const adminloginSchema =mongoose.Schema({
    username:String,
    password:String
});

module.exports =mongoose.model('adminlog',adminloginSchema);