const mongoose =require('mongoose');


const addressSchema =mongoose.Schema({
    companyname:String,
    address:String,
    mobile:Number,
    tel:{Number,String}

});


module.exports =mongoose.model('address',addressSchema);