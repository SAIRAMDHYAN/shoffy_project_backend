const mongoose=require('mongoose')

// mongoose.connect('')
// .then(()=>console.log('connection successful in ProductModel'))
// .catch((err)=>{console.log('connection failed',err)})

let UserAddressSchema=new mongoose.Schema({
    firstName: {type:String},
    lastName: {type:String},
    countryRegion: {type:String},
    inputAddress2: {type:String},
    inputCity: {type:String},
    inputState: {type:String},
    inputZip: {type:String},
    email: {type:String},
    phonenum: {type:String}
})

let AddressModel=mongoose.model('user_Address',UserAddressSchema)

module.exports=AddressModel