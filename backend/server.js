//create http server
const exp = require("express");
const app = exp();

const cors=require('cors');
app.use(cors({
  origin:'http://localhost:5173'
}))

require('dotenv').config() 

const { MongoClient } = require("mongodb");
let mClient = new MongoClient(process.env.DB_URL);

//connect to mongodb server
mClient
  .connect()
  .then((connectionObj) => {   
    const fsddb=connectionObj.db('pvpdb');
    const usersCollection=fsddb.collection('users')
    const productsCollection=fsddb.collection('products')
    app.set('usersCollection',usersCollection);
    app.set('productsCollection',productsCollection);
    console.log("DB connection success");
    app.listen(process.env.PORT, () => console.log("http server started on port 4000"));
  })
  .catch((err) => console.log("Error in DB connection", err));

const userApp = require("./APIs/userApi");
const productApp = require("./APIs/productsApi");

app.use("/user-api", userApp);
app.use("/product-api", productApp);

//invalid paths
app.use('*',(req,res,next)=>{
  console.log(req.path)
  res.send({message:`Invalid path`})
})

//error in middleware
app.use((err,req,res,next)=>{
  res.send({message:"error occurred",errorMessage:err.message})
})