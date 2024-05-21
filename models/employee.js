
let mongoose=require('mongoose')

// let {connection_string}=process.env

// mongoose.connect('mongodb://127.0.0.1:27017/registration')
// .then(()=>{console.log('connection Succesful')})
// .catch((err)=>{console.log('connection failed' , err)})




let EmployeeSchema=new mongoose.Schema({
    name:{type:String},
    email:{type:String},
    password:{type:String},
    image: { type: String },
    userType:{type:String}
})

let EmployeeModel=mongoose.model('employee',EmployeeSchema)

module.exports=EmployeeModel    