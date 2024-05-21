
let jwt=require('jsonwebtoken')

let isLoggedIn=(req,res,next)=>{

    let token=req.cookies.token;

    if(token){
        res.json('Sucess')
  jwt.verify(token,process.env.SECRET_KEY,(err,decoded)=>{
    if(err) {
      // res.json('Invalid token')
    }
    next()
  })
    }
    if(!token){
        res.json('The token was not available')
    }

}

module.exports=isLoggedIn
