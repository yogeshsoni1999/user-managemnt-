const router =require('express').Router();
const Adminlogin =require('../models/adminlogin');
const banner = require('../models/banner');
const Banner =require('../models/banner');
const Contact =require('../models/contact');
const Address =require('../models/address');
const userReg =require('../models/registration');
const Testi =require('../models/testi');
const multer =require('multer');
const Gallery =require('../models/gallery');
const testi = require('../models/testi');
const nodemailer=require('nodemailer');

const Parking =require('../models/parking');

//------------------------------------------------------
let a=new Date()

let date=a.getDate()   
let month=a.getMonth()  
let year=a.getFullYear()
let hour=a.getHours()
let  min=a.getMinutes()        

let d1=month+'/'+date+'/'+year
//-----------------------------------------------------------
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
});


let sess;

function handleLogin(req,res,next){     //this is a function to make login secure
    if(req.session.isAuth){
        next();
    }else{
        res.redirect('/admin')
    }
}


router.get('/',(req,res)=>{
    res.render('admin/adminlogin.ejs',{message:''});
})
router.post('/adminrecord',async(req,res)=>{
    console.log(req.body);
    const username =req.body.username;
    const pass =req.body.password;
    const adminrecord =await Adminlogin.findOne({username:username})
    console.log(adminrecord);
    if(adminrecord!==null){
        if(adminrecord.password==pass){
            req.session.isAuth=true;
            sess=req.session;
            sess.username=username;
            console.log(sess.username)
        res.redirect('/admin/dashboard')
        }else{
        //res.redirect('/admin')
        res.render('admin/adminlogin.ejs',{message:'Wrong username and password'});
    }
    }else{
       // res.redirect('/admin')
        res.render('admin/adminlogin.ejs',{message:'Wrong username and password'});
    }
})

router.get('/dashboard',handleLogin,(req,res)=>{
    res.render('admin/dashboard.ejs',{username:sess.username});
});

router.get('/logout',(req,res)=>{
    req.session.destroy();
    sess='';
    console.log(sess.username);
    res.redirect('/admin')
})

router.get('/banner',async(req,res)=>{
    const bannerRecord =await banner.findOne()
    res.render('admin/banner.ejs',{message:"hello",bannerRecord})
})

router.get('/bannerupdate/:id',async(req,res)=>{
    const id =req.params.id;
   const bannerdata= await Banner.findById(id)
    res.render('admin/bannerupdate.ejs',{bannerdata})
})
router.post('/bannerupdate/:id',upload.single('img'),async(req,res)=>{
    //const imgName =req.file.filename;
    const id =req.params.id;
    const {title,desc,ldesc}=req.body
    // this img if condition is used when you want change title but not image
    if(req.file){
    const imgName =req.file.filename;
   await Banner.findByIdAndUpdate(id,{title:title,desc:desc,ldesc:ldesc,img:imgName})
    }else{
    await Banner.findByIdAndUpdate(id,{title:title,desc:desc,ldesc:ldesc})
    }

   const bannerRecord =await banner.findOne()
   res.render('admin/banner.ejs',{message:"Successfully Updated",bannerRecord})

})

router.get('/contact',async(req,res)=>{
    const contactrecord =await Contact.find().sort({status:-1})
    res.render('admin/contact',{message:"",contactrecord})
})

router.get('/contactstatusupdate/:id',async(req,res)=>{
    const id =req.params.id;
    const contactrecord =await Contact.findById(id);
    console.log(contactrecord);
    let newStatus=null;
    if(contactrecord.status=='unread'){
        //contactrecord.status='read'
        newStatus='read'

    }else{
        //contactrecord.status='unread'
        newStatus='unread'
    }
    await Contact.findByIdAndUpdate(id,{status:newStatus})
    res.redirect('/admin/contact')
})
router.get('/deletequery/:id',async(req,res)=>{
    const id =req.params.id;
   await Contact.findByIdAndDelete(id);
   //res.redirect('/admin/contact');
   const contactrecord =await Contact.find()
    res.render('admin/contact',{message:"Successfully Deleted",contactrecord})
})

router.post('/contactsearch',async(req,res)=>{
const searchvalue =req.body.search;
const searchrecord = await Contact.find({status:searchvalue});
res.render('admin/contact.ejs',{message:"" ,contactrecord:searchrecord});
})

router.get('/address',async(req,res)=>{
    const addressrecord = await Address.findOne();
    res.render('admin/address.ejs',{message:"" ,addressrecord})
})
router.get('/addressupdate/:id',async(req,res)=>{
    const id =req.params.id;
    const addressdata =await Address.findById(id);
    res.render('admin/addressupdate.ejs',{addressdata})
})
router.post('/addressupdate/:id',async(req,res)=>{
const id = req.params.id;
const {companyname,address,mobile,tel}=req.body
await Address.findByIdAndUpdate(id,{companyname:companyname,address:address,mobile:mobile,tel:tel})
const addressrecord = await Address.findOne();
res.render('admin/address.ejs',{message:"Successfully Updated" ,addressrecord})
})

router.get('/registration',async(req,res)=>{
    const usersData = await userReg.find();
    const userCount = await userReg.count();     //tablename.count() is used to differentiate value
    const userActive = await userReg.count({status:'Active'}); 
    const userSuspended = await userReg.count({status:'suspended'})
    res.render('admin/registration.ejs',{usersData,userCount,userActive,userSuspended})
})

router.get('/regstatusupdate/:id',async(req,res)=>{
    const id =req.params.id
    const userrecord = await userReg.findById(id);
    let newStatus=null;
    if(userrecord.status=='suspended'){   
    newStatus='Active'
    }else{
        newStatus='suspended'
    }
    await userReg.findByIdAndUpdate(id,{status:newStatus})
    res.redirect('/admin/registration')
})

router.get('/regstatusdelete/:id',async(req,res)=>{
    const id = req.params.id;
    await userReg.findByIdAndDelete(id);
    const usersData =await userReg.find()
    const userCount = await userReg.count();
    res.render('admin/registration',{usersData,userCount})

})

router.get('/userroleupdate/:id',async(req,res)=>{
   const id= req.params.id;
  const userrecord = await userReg.findById(id);
  let newStatus=null;
  if(userrecord.role=='public'){
    newStatus='private'
  }else{
    newStatus='public'
  }
  await userReg.findByIdAndUpdate(id,{role:newStatus})
  res.redirect('/admin/registration')

})

router.post('/usersearch',async(req,res)=>{
const searchUser=req.body.user;
//console.log(searchUser)
const usersearch= await userReg.find({username:searchUser})
const usersData = await userReg.find();
const userCount = await userReg.count();     //tablename.count() is used to differentiate value
const userActive = await userReg.count({status:'Active'}); 
const userSuspended = await userReg.count({status:'suspended'})
res.render('admin/registration.ejs',{usersData,userCount,userActive,userSuspended,usersData:usersearch})




})


router.get('/testi',async(req,res)=>{
    const testirecord = await Testi.find().sort({postedDate:-1})      // .sort({}) make data show in priority base(who come last,shows first)
    const testiCount=await testi.count();
    const testiActive=await testi.count({status:'active'});
    const testiInactive=await testi.count({status:'inactive'});
    res.render('admin/testi.ejs',{message:"",testirecord,testiCount,testiActive,testiInactive})
});

router.get('/testistatus/:id',async(req,res)=>{
   const id = req.params.id;
   const testirecord =await Testi.findById(id);

   let newStatus=null; 
   if(testirecord.status=='inactive'){
    newStatus='active'
   }else{
    newStatus='inactive'
   }
   await Testi.findByIdAndUpdate(id,{status:newStatus});
   res.redirect('/admin/testi')

})

router.get('/testidelete/:id',async(req,res)=>{
    const id =req.params.id;
    const testirecord= await Testi.findById(id);
    await Testi.findByIdAndDelete(id,{testirecord});
    res.redirect('/admin/testi');
})
//---------------------upload testinorminals in gallery-------------------------------------

router.post('/uploadtesti',upload.single('testiupload'),async(req,res)=>{
    const img=req.file.filename;
    const galleryrecord = await new Gallery({galleryimg:img})
    galleryrecord.save();
    //console.log(galleryrecord)
   // res.redirect('/admin/testi')
    const testirecord = await Testi.find().sort({postedDate:-1})
    const testiCount=await testi.count();
    const testiActive=await testi.count({status:'active'});
    const testiInactive=await testi.count({status:'inactive'});
    res.render('admin/testi.ejs',{message:"Successfully Uploaded in Gallery",testirecord,testiCount,testiActive,testiInactive})
   

})

router.get('/mail',async(req,res)=>{

        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();
      
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: 'dudeyogeshsoni@gmail.com', // generated ethereal user
            pass: 'ipvldrmaxhvznvxe', // generated ethereal password
          },
        });
      
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: 'dudeyogeshsoni@gmail.com', // sender address
          to: "", // list of receivers
          subject: "Hello ✔", // Subject line
          text: "Hello world?", // plain text body
         // html: "<b>Hello world?</b>", // html body
        });
      
        //console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      
        // Preview only available when sending through an Ethereal account
        //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      
})

router.get('/emailsend/:id',async(req,res)=>{
    const id=req.params.id;
    const queryrecord= await Contact.findById(id)
    res.render('admin/email.ejs',{queryrecord})
})

router.post('/emailrecord',upload.single('attechment'),async(req,res)=>{
    const path=req.file.path;    // we take path bcz we don't want to save this img.
    const {to,from,sub,attechment,mail}=req.body;

    // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = await nodemailer.createTestAccount();
      
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: 'dudeyogeshsoni@gmail.com', // generated ethereal user
            pass: 'ipvldrmaxhvznvxe', // generated ethereal password
          },
        });
      
        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: from, // sender address
          to: to, // list of receivers
          subject: sub, // Subject line
          text: mail, // plain text body
          // html: "<b>Hello world?</b>", // html body is used to send table,and any html related doc.
          attachments:[{
            path:path
          }]   
        });
      
      
})


//----------------------------------------project:3 parking managment--------------------------------------------

router.get('/parkinginsert',(req,res)=>{
    res.render('admin/parkinginsert.ejs')
})

router.get('/parking',async(req,res)=>{
    const parkingRecord =await Parking.find().sort({receipt: -1})
   res.render('admin/parking.ejs',{parkingRecord})
})

router.post('/parkingrecords',async(req,res)=>{
    //console.log(req.body)
    let date= new Date();
    const{vn,vtype,rp}=req.body;
    let intime=new Date()
    const parkingrecord =new Parking({vno:vn,vin:intime,vout:"",vtype:vtype,amount:"0",status:"IN",receipt:rp})
    await parkingrecord.save();
    console.log(parkingrecord)
    res.redirect('/admin/parking')
})

// router.get('/parkingupdate/:id',(req,res)=>{
// const id=req.params.id;
// res.render('admin/parkingupdate.ejs',{id})
// })

router.get('/parkingupdate/:id',async(req,res)=>{
    const id=req.params.id;
    //const{outtime}=req.body;
    let outtime=new Date()
    const parkingdata =await Parking.findById(id);
    let totalTime= (new Date(outtime)-new Date(parkingdata.vin))/(1000*60*60)
    //console.log(totalTime)
    let amount=null;
    if(parkingdata.vtype=='two'){
    amount= Math.round(totalTime*20)    //Math.round is used for roundoff amount
    }else if(parkingdata.vtype=='three'){
        amount=Math.round(totalTime*30)
    }else if(parkingdata.vtype=='four'){
        amount=Math.round(totalTime*40)
    }else if(parkingdata.vtype=='other'){
        amount=Math.round(totalTime*50)
    }else{
        amount=0;
    }

    await Parking.findByIdAndUpdate(id,{amount:amount,status:'OUT',vout:outtime})
    res.redirect('/admin/parking')
})

router.get('/printout/:id',async(req,res)=>{
    const id= req.params.id;
    const printoutrecord =await Parking.findById(id);
    res.render('admin/printout.ejs',{printoutrecord})
})

router.post('/receipt',async(req,res)=>{
    const parkingRecord =await Parking.find().sort({receipt: -1})
   
    const searchReceipt =req.body.receipt;
    const search =await Parking.find({receipt:searchReceipt})
    res.render('admin/parking.ejs',{parkingRecord,parkingRecord:search})
})

//------------------------test----------------------------------------

router.get('/test',(req,res)=>{
    const testirecord =new Testi({quotes:'quotes',companyname:'company',status:'inactive'})
    testirecord.save();
    
})


module.exports =router;