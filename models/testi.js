const mongoose =require('mongoose')

const testiSchema =mongoose.Schema({
    quotes:String,
    companyname:String,
    status:String,
    img:String,
    postedDate:String
});

module.exports =mongoose.model('testi',testiSchema)