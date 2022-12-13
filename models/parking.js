const mongoose =require('mongoose');


const parkingSchema =mongoose.Schema({
    vno:String,
    vin:String,
    vout:String,
    vtype:String,
    receipt:String,
    amount:Number,
    status:String,
    date:String
});

module.exports =mongoose.model('parking',parkingSchema)