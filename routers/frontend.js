const router =require('express').Router();
const Banner =require('../models/banner');
const Contact =require('../models/contact');
const Address =require('../models/address');
const userReg =require('../models/registration');
const Testi =require('../models/testi');
const Gallery=require('../models/gallery');
const bcrypt =require('bcrypt'); // it is used to encrypt password for protection 
const multer =require('multer');  // it is used for upload images

let sess=null;  //it is globle variable for session to create session

function handleLogin(req,res,next){
    if(req.session.isAuth){
    next();
    }else{
        res.redirect('/login')
    }
}

function handleRole(req,res,next){
    if(sess.role!=='public'){
    next();
    }else{
        res.send("You don't have right to see the contain of this page")
    }
}

//setup for images
let storage=multer.diskStorage({
    destination:function(req,file,callback){
        callback(null,'./public/upload')
    },
    filename:function(req,file,callback){
        callback(null,Date.now()+file.originalname)
    },

})

let upload =multer({
    storage:storage,
    limits:{fileSize:1024*1024*5}
})

router.get('/',handleLogin,async(req,res)=>{
    const bannerRecord = await Banner.findOne();
    const addressrecord = await Address.findOne();
    const testirecord = await Testi.find({status:'active'});
    if(sess!==null){
    res.render('index.ejs',{bannerRecord,addressrecord,testirecord,username:sess.username});
    }else{
    res.render('index.ejs',{bannerRecord,addressrecord,testirecord,username:'hello'});
    }
})

router.get('/banner',handleLogin,handleRole,async(req,res)=>{
    const bannerRecord =await Banner.findOne({role:'private'})
    const addressrecord = await Address.findOne()
    if(sess!==null){
    res.render('banner.ejs',{bannerRecord,addressrecord,username:sess.username})
    }else{
    res.render('banner.ejs',{bannerRecord,addressrecord,username:'hello'}) 
    }
})
router.post('/contactrecord',(req,res)=>{
    const {email,query,status} =req.body;
    const contactrecord =new Contact({email:email,query:query,status:'unread'})
    contactrecord.save();
    res.redirect('/')

})

router.get('/registration',async(req,res)=>{
const addressrecord = await Address.findOne()
if(sess!==null){
res.render('registration.ejs',{message:"",addressrecord,username:sess.username})
}else{
 res.render('registration.ejs',{message:"",addressrecord,username:'hello'})
}
})

router.post('/registrationdata',async(req,res)=>{
    const {username,password}=req.body
    const convertedpassword = await bcrypt.hash(password,10)
    const userrecord = await userReg.findOne({username:username})
    if(userrecord!==null){
        const addressrecord = await Address.findOne()
        if(sess!==null){
        res.render('registration.ejs',{message:"Username is already exist",addressrecord,username:sess.username})
        }else{
         res.render('registration.ejs',{message:"Username is already exist",addressrecord,username:'hello'})
        }
    }else{
    const regrecord = new userReg({username:username,password:convertedpassword,firstname:"",lastname:"",email:"",status:"suspended",role:"public",profileimg:'default.jpg'}) // here default.jpg is way to send default pic like blank pic
    await regrecord.save()
    //console.log(regrecord);

    const addressrecord = await Address.findOne()
    if(sess!==null){
    res.render('login.ejs',{message:"Profile successfully created",addressrecord,username:sess.username})
    }else{
    res.render('login.ejs',{message:"Profile successfully created",addressrecord,username:'hello'})
    }

    }
    

});
router.get('/login',async(req,res)=>{
    const addressrecord = await Address.findOne()
    if(sess!==null){
        res.redirect('/')
    }else{
        res.render('login.ejs',{message:"",addressrecord,username:'hello'})
    }

})
    
router.post('/loginrecord',async(req,res)=>{
    const {username,password} =req.body;
    const userrecord =await userReg.findOne({username:username})
    if(userrecord!==null){
    const dd =await bcrypt.compare(password,userrecord.password)  //here bycrypt.compare is used to compare encrypt password which is define during reg.
   // console.log(dd)
   if(dd){
    if(userrecord.status=='Active'){
        req.session.isAuth=true;    // this is created to give security to pages

        sess=req.session            // to create  session variable by assign globle variable
        sess.username=username;
        sess.role=userrecord.role;
        console.log(sess.username)
     
    res.redirect('/userprofile')
    }else{
        res.send("Your account is suspended please contact with your Admin")
    }
   }else{
    const addressrecord = await Address.findOne()
    res.render('login.ejs',{message:"Wrong username and password",addressrecord,username:"hello"})
   }
    }else{
    res.redirect('/login')
    }
})
router.get('/userprofile',handleLogin,async(req,res)=>{
    const addressrecord = await Address.findOne()
    if(sess!==null){
    const userrecord =await userReg.findOne({username:sess.username})   //detail of user who login
    res.render('userprofile.ejs',{addressrecord,userrecord,username:sess.username})
    }else{
    res.render('userprofile.ejs',{addressrecord,username:'hello'})
    }
})

router.post('/profileupdate/:id',upload.single('img'),async(req,res)=>{
const imgName=req.file.filename;
const id =req.params.id;
const{fname,lname,email}=req.body;
const addressrecord = await Address.findOne();
if(sess!==null){
await userReg.findByIdAndUpdate(id,{firstname:fname,lastname:lname,email:email,profileimg:imgName})
const userrecord =await userReg.findOne({username:sess.username})
res.render("userprofile.ejs",{addressrecord,userrecord,username:sess.username})
}else{
res.render("userprofile.ejs",{addressrecord,username:'hello'})
}

})

router.get('/logout',(req,res)=>{
    req.session.destroy();    //here destroy is a method
    sess=null;
    res.redirect('/login')
})

router.get('/testi',async(req,res)=>{
    const addressrecord = await Address.findOne()
    if(sess!==null){
    res.render('testi.ejs',{addressrecord,username:sess.username})
    }else{
    res.render('testi.ejs',{addressrecord,username:'hello'})
    }

});

router.post('/testiupload',upload.single('img'),async(req,res)=>{
    let posteddate=new Date();
    const imgName= req.file.filename;
    const {quotes,companyname} =req.body;
    const testirecord = new Testi({quotes:quotes,companyname:companyname,status:'inactive',img:imgName,postedDate:posteddate})
    await testirecord.save();
    res.redirect('/')
    //console.log(testirecord)

})

router.get('/gallery',async(req,res)=>{
    const addressrecord = await Address.findOne()
    const galleryrecord =await Gallery.find()
    if(sess!==null){
    res.render('gallery.ejs',{addressrecord,galleryrecord,username:sess.username})
    }else{
    res.render('gallery.ejs',{addressrecord,galleryrecord,username:'hello'})
    }
})

router.get('/changepassword',async(req,res)=>{
    const addressrecord = await Address.findOne()
    if(sess!==null){
    res.render('changepassword.ejs',{message:"",addressrecord,username:sess.username})
    }else{
    res.render('changepassword.ejs',{message:"",addressrecord,username:'hello'}) 
    }
    //res.render('changepassword.ejs')
})

router.post('/password/:username',async(req,res)=>{
    const{cpass,npass}=req.body;
    convertedpassword =await bcrypt.hash(npass,10)
    const username=req.params.username;
    const userrecord =await userReg.findOne({username:username}) //first is database username second is here
    const id=userrecord.id;
    //console.log(userrecord);
    const passwordcompare =await bcrypt.compare(cpass,userrecord.password) // cpass from form and second from table(database)
    //console.log(passwordcompare)
    if(passwordcompare){
        const addressrecord = await Address.findOne()
        await userReg.findByIdAndUpdate(id,{password:convertedpassword})
        res.render('changepassword.ejs',{message:"Password channged successfully",addressrecord,username:sess.username})
    }else{
    const addressrecord = await Address.findOne()
    if(sess!==null){
    res.render('changepassword.ejs',{message:"Current Password Not Matched",addressrecord,username:sess.username})
    }else{
    res.render('changepassword.ejs',{message:"Current Password Not Matched",addressrecord,username:'hello'}) 
    }
    }
    
})

//---------------------------------demo image upload--------------------------------
router.get('/upload',(req,res)=>{
    res.render('uploadform.ejs')
})

router.post('/uploadimg',upload.single('img'),(req,res)=>{
    console.log(req.file.filename);
})



module.exports =router;