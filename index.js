
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');

const EmployeeModel = require('./models/employee')
const ProductModel=require('./models/productes.js')
const AddressModel=require('./models/userAddress.js')
const isLoggedIn = require('./middlwear/isLoggedIn');
const connectDB =require('./connection/mongodbConnection.js')
connectDB()
// const stripe=require('stripe')('sk_test_51PDl42SEOjYfDbZD5rKRl6YkbbDPQDjhGVev9JAbjSwrd9TmLaOUJyMGVNVeGmDRZLewhfjvqNoVFogMAUAToGt200AcuXtHyl')
const app = express();
const port = 3002;
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/users')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname
        cb(null, uniqueSuffix)
    }
});

const upload = multer({ storage: storage });

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));


app.use('/uploads', express.static('uploads'));


let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'shofyproject@gmail.com',
        pass: 'xowb zkxl morc unwb'
        // user: 'sairamdhyanhp@gmail.com',
        // pass: 'fppj sgmu dbry yqoc'
    }
});



app.post('/register', upload.single('image'), async (req, res) => {
    const { name, email, password,userType } = req.body;
    const imagePath = req.file ? req.file.path : ''; 
console.log(userType)
    try {
        const hashed_password = await bcrypt.hash(password, 10);
        const employee = await EmployeeModel.create({ 
            name, 
            email, 
            password: hashed_password, 
            image: imagePath,
            userType
        });
        res.status(201).json(employee);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to register user", details: err });
    }
});

// app.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const employee = await EmployeeModel.findOne({ email });
//         if (!employee) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const isMatch = await bcrypt.compare(password, employee.password);
//         if (!isMatch) {
//             return res.status(400).json({ error: 'Invalid credentials' });
//         }

//         const token=jwt.sign({email:employee.email},process.env.SECRET_KEY,{expiresIn:'1h'})       
//          res.json({
//             message: 'Login successful',
//             image: employee.image,
//             userType:userType,
//             token
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(process.env.SECRET_KEY)
    try {
        const employee = await EmployeeModel.findOne({ email });
        if (!employee) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, employee.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }


        const { userType } = employee;

        const token = jwt.sign(
            { email: employee.email, userType: userType },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            image: employee.image,
            userType,
            token,
            email
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', details: err.toString() });
    }
});

const product_upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/products/')
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + file.originalname;
            cb(null, uniqueSuffix);
        }
    })
});

app.post('/products', product_upload.single('image'), async (req, res) => {
    console.log(req.body); 
    try {
        const {id, title, description, price, rating, brand, category } = req.body;
        const imagePath = req.file ? req.file.path : '';
    console.log(req.body)
        const newProduct = await ProductModel.create({
            id,
            title,
            description,
            price,
            rating,
            brand,
            category,
            image:imagePath,
        });

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/userAddress',upload.none(),async(req,res)=>{
    const{firstName,lastName,countryRegion,inputAddress2,inputCity,inputState,inputZip,email,phonenum}=req.body;
    console.log('req.body',req.body)
    try {
        const userAddress=await AddressModel.create({
            firstName,
            lastName,
            countryRegion,
            inputAddress2,
            inputCity,
            inputState,
            inputZip,
            email,
            phonenum
        })
        res.status(201).json(userAddress) 
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ error: 'Server error' });
    }
})

app.get('/users',async(req,res)=>{
    try{
    
        const users=await EmployeeModel.find() 
        res.json(users)
        
    }catch(error){
        console.log('Error in fetching Users:', error)
        res.status(500).json({ error: 'Server error' });
    }
})


app.get('/api/products',async(req,res)=>{
    try{
        const productsMdb=await ProductModel.find()
        console.log(productsMdb)
        res.json(productsMdb);
           
    }catch(error){
        console.log('Error in fetching data', error)
    }
})


app.put('/api/products/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
      const updatedProductData = req.body; 
     
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        productId,
        updatedProductData,
        { new: true } 
      );
  
      res.json(updatedProduct); 
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

//route to delete product
  app.delete('/api/products/:productId', async (req, res) => {
    try {
      const { productId } = req.params;
  
      // Find the product by ID and delete it
      const deletedProduct = await ProductModel.findByIdAndDelete(productId);
  
      if (!deletedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });


  app.get('/fetchAddress',async(req,res)=>{
            
    const { email } = req.query; 
            try {
                const address = await AddressModel.findOne({ email });
                console.log(address)
        res.json(address);
            } catch (error) {
                console.log('Error in fetching userAddress',error)
                res.status(500).json({ error: 'Failed to fetch user address' })
            }
  })

// Update user address
// app.post('/updateAddress/:email', async (req, res) => {
//     const { email, address } = req.body;
//     try {
//         const updatedUser = await User.findOneAndUpdate(
//             { email: email }, // find a document by email
//             { address: address }, // set new address
//             { new: true } // return the updated document
//         );
//         if (updatedUser) {
//             res.status(200).json(updatedUser);
//         } else {
//             res.status(404).send('User not found');
//         }
//     } catch (error) {
//         console.error('Error updating user address:', error);
//         res.status(500).send('Error updating user information');
//     }
// });

// const razorpay = new Razorpay({
//     key_id: 'rzp_test_Pm4C89CecwOsP1', //'YOUR_KEY_ID'
//     key_secret: 'FuO3j2LdMNWUKK2vosMuuEol   '//'YOUR_KEY_SECRET'
//   });
  
//   app.post('/create-order', async (req, res) => {
//     const options = {
//       amount: 1000, // Amount in paisa
//       currency: 'INR',
//       receipt: 'order_receipt_1',
//       payment_capture: 1 // Auto-capture payment
//     };
  
//     try {
//       const response = await razorpay.orders.create(options);
//       res.json(response);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });



app.post('/order', async (req, res) => {
    console.log(process.env.RAZORPAY_KEY_ID);
    console.log(process.env.RAZORPAY_KEY_SECRET);
    try {
        const razorpay = new Razorpay({

            key_id: process.env.RAZORPAY_KEY_ID, //'KEY_ID'
            key_secret: process.env.RAZORPAY_KEY_SECRET//'KEY_SECRET'
        });

        if (!req.body) {
            return res.status(400).send('Bad request');
        }

        const options = req.body;
        console.log(options)
        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(400).send('Bad Request in creating order');
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});



  /// nodemailer

  app.post('/send-email', (req, res) => {
 
    const {email}=req.body
  console.log(email)
    let mailOptions = {
        // from: 'sairamdhyanhp@gmail.com',
        from: 'shofyproject@gmail.com',
        to: email,
        subject: 'Payment Confirmation',
        text: 'Thank you for your payment. Your order has been successfully processed.'
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Email sending failed:', error);
            res.status(500).send('Email sending failed');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).send('Email sent successfully');
        }
    });
});
  

// app.get('/', (req, res) => {
//     res.send('Success')
//     res.json({ message: "Welcome to the Home Page!" });
// });


app.listen(port, () => {
    console.log('Server is running on port', port);
});



///////////////////////////////////////
// require('dotenv').config();
// const express = require('express');
// const bcrypt = require('bcrypt');
// const multer = require('multer');
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
// const cors = require('cors');
// const EmployeeModel = require('./models/employee');
// const ProductModel = require('./models/productes.js');
// const isLoggedIn = require('./middlwear/isLoggedIn');

// const app = express();
// const port = 3002;
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/users');
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + file.originalname;
//         cb(null, uniqueSuffix);
//     }
// });

// const upload = multer({ storage: storage });

// app.use(cors({
//     origin: ['http://localhost:3000'],
//     credentials: true
// }));

// app.use('/uploads', express.static('uploads'));

// // Middleware to authenticate user
// const authenticateUser = (req, res, next) => {
//     const token = req.cookies.token;

//     if (!token) {
//         return res.status(401).json({ error: 'Unauthorized: No token provided' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.SECRET_KEY);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         return res.status(403).json({ error: 'Unauthorized: Invalid token' });
//     }
// };

// // Middleware to check if user is admin
// const isAdmin = (req, res, next) => {
//     if (req.user.userType !== 'admin') {
//         return res.status(403).json({ error: 'Forbidden: User is not an admin' });
//     }
//     next();
// };

// app.post('/register', upload.single('image'), async (req, res) => {
//     const { name, email, password, userType } = req.body;
//     const imagePath = req.file ? req.file.path : '';

//     try {
//         const hashed_password = await bcrypt.hash(password, 10);
//         const employee = await EmployeeModel.create({
//             name,
//             email,
//             password: hashed_password,
//             image: imagePath,
//             userType
//         });
//         res.status(201).json(employee);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Failed to register user", details: err });
//     }
// });

// app.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const employee = await EmployeeModel.findOne({ email });
//         if (!employee) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const isMatch = await bcrypt.compare(password, employee.password);
//         if (!isMatch) {
//             return res.status(400).json({ error: 'Invalid credentials' });
//         }

//         const payload = {
//             email: employee.email,
//             userType: employee.userType // Include userType in JWT payload
//         };
//         const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1h' });

//         res.cookie('token', token, { httpOnly: true }); // Set token in cookie
//         res.json({
//             message: 'Login successful',
//             image: employee.image,
//             userType: employee.userType
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error', details: err.toString() });
//     }
// });

// app.get('/admin/users',authenticateUser, isAdmin,async(req,res)=>{
//     try{
    
//         const users=await EmployeeModel.find() 
//         res.json(users)
        
//     }catch(error){
//         console.log('Error in fetching Users:', error)
//         res.status(500).json({ error: 'Server error' });
//     }
// })


// app.get('/admin/products',authenticateUser, isAdmin,async(req,res)=>{
//     try{
//         const productsMdb=await ProductModel.find()
//         console.log(productsMdb)
//         res.json(productsMdb);
           
//     }catch(error){
//         console.log('Error in fetching data', error)
//     }
// })

// // Define route to handle PUT requests to update a product
// app.put('/admin/products/:productId', async (req, res) => {
//     try {
//       const { productId } = req.params;
//       const updatedProductData = req.body; // Updated product data from the request body
  
//       // Find the product by ID and update its data
//       const updatedProduct = await ProductModel.findByIdAndUpdate(
//         productId,
//         updatedProductData,
//         { new: true } // Return the updated document
//       );
  
//       res.json(updatedProduct); // Send the updated product data back to the client
//     } catch (error) {
//       console.error('Error updating product:', error);
//       res.status(500).json({ error: 'Failed to update product' });
//     }
//   });

// //route to delete product
//   app.delete('/admin/products/:productId', async (req, res) => {
//     try {
//       const { productId } = req.params;
  
//       // Find the product by ID and delete it
//       const deletedProduct = await ProductModel.findByIdAndDelete(productId);
  
//       if (!deletedProduct) {
//         return res.status(404).json({ error: 'Product not found' });
//       }
  
//       res.json({ message: 'Product deleted successfully' });
//     } catch (error) {
//       console.error('Error deleting product:', error);
//       res.status(500).json({ error: 'Failed to delete product' });
//     }
//   });


// app.listen(port, () => {
//     console.log('Server is running on port', port);
// });