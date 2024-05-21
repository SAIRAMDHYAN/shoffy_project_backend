const mongoose=require('mongoose')

// mongoose.connect('mongodb://127.0.0.1:27017/registration')
// .then(()=>console.log('connection successful in ProductModel'))
// .catch((err)=>{console.log('connection failed',err)})

let ProductSchema=new mongoose.Schema({
    id:{type:Number},
    title:{type:String},
    description:{type:String},
    price:{type:Number},
    rating:{type:Number},
    brand:{type:String},
    category:{type:String},
    image:{type:String}
})

let ProductModel=mongoose.model('products',ProductSchema)

module.exports=ProductModel


