const mongoose =require('mongoose');

const imgSchema =mongoose.Schema({
    galleryimg:String
});

module.exports =mongoose.model('gallery',imgSchema)