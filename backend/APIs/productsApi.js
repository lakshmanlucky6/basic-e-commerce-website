const exp=require('express');
const productApp=exp.Router();
const expressAsyncHandler=require('express-async-handler')

productApp.get('/products',expressAsyncHandler(async(req,res)=>{
    let productsCollection=req.app.get('productsCollection')
    let productsList=await productsCollection.find().toArray()
    res.send({message:'products',payload:productsList})
}))

//product by id
productApp.get('/products/:id',expressAsyncHandler(async(req,res)=>{
      let productsCollection=req.app.get('productsCollection')
      let productId=Number(req.params.id)
      let product=await productsCollection.findOne({id:productId})
      res.send({message:"product",payload:product})
}))
module.exports=productApp;






