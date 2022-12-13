const express =require('express') // function
const  app =express() //module
app.use(express.urlencoded({extended:false})); // it is important to get data from form 
const adminRouter =require('./routers/admin') // get admin router
const frontRouter=require('./routers/frontend');
const mongoose =require('mongoose') //module
const session =require('express-session');





mongoose.connect('mongodb://127.0.0.1:27017/mainproject',()=>{
    console.log("connected to DB main project");
})


app.use(session({
    secret:'yogesh',
    resave:false,
    saveUninitialized:false,
    cookie:{maxAge:30*24*60*60*1000}    // cookies:{maxAge} is used to increase login duration.
}));
app.use('/admin',adminRouter);
app.use(frontRouter);
app.use(express.static('public'));
app.set('view engine','ejs');
app.listen(5000,()=>{
    console.log('server is running on port 5000');
})