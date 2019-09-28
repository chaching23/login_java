var session = require('express-session');
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const flash = require('express-flash');
app.use(flash());
var bcrypt = require('bcrypt');
const emailRegex = require('email-regex');

app.use(session({
  secret: 'keyboardkitteh',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

app.use(bodyParser.urlencoded({ extended: true }));
var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');


var fromfuture = function(birthday){
  return birthday < Date.now();
}
  

mongoose.connect('mongodb://localhost/login');
var UserSchema = new mongoose.Schema({
    first_name:  { type: String, required: [true, "First name is required"], minlength: 2 },
    last_name:  { type: String, required: [true, "Last name is required"], minlength: 2  }, 
    email: {type: String, trim: true, lowercase: true, unique: true, required: "Email is required", match: [/^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/, "Please fill in a valid email address"]},
    password:   { type: String, required: [true, "Password is required"], minlength: 2  },
    birth_date: { type: Date , required: [true, "Birth date is required"] , validate: [fromfuture, "Brithday is not from future"] }
}); 




mongoose.model('User', UserSchema); 
var User = mongoose.model('User') 



  


app.post('/reg', function(req, res) {
    if(emailRegex().test(req.body.email)!=true){
      req.flash('regsiter', "email is not valid");

    }
    User.find({email:req.body.email},function(err,user){
      if(err){
        console.log('email not available');
        res.redirect('/')
      }
      else if(user.length ==0){
        console.log(user);
        console.log('email avalible');

      }
      else{
        console.log('email unavailble');
        req.flash('register', 'email unavailable');
      }
    })

  if (req.body.password != req.body.cpassword){
    req.flash('register','passwords do not match.');
    res.redirect('/')
  }
  else{
    }

    var user = new User({first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        birth_date: req.body.birth_date});
    user.save(function(err) {
      if(err){
        console.log("We have an error!", err);
        for(var key in err.errors){
            req.flash('registration', err.errors[key].message);
        }
        res.redirect('/');
    }





      else {
          console.log(user)
          req.session.id = user._id;
          var hash_pass = bcrypt.hashSync(req.body.password, 10);
          user.password = hash_pass;
          console.log(user)
          user.save();
        res.redirect('/sucess');

      }

    });


});








// app.post('/login', (req, res) => {
//   console.log(" req.body: ", req.body);




//   User.findOne({email:req.body.email}, function (err, user)  {
//     if(err){
  
//       req.flash('registration', 'email does not exist');
//       res.redirect('/');
//     }
//   })

  

//     else{

//       bcrypt.compare(req.body.password, user.password, function (err, validp){
//         if(err){
  
//           req.flash('registration', 'email does not exist');
//           res.redirect('/');
//         }
//     else{validp=fasle}



//           req.session.email = user.email;
          

//       res.redirect('/sucess');

//     }

//   }
//   });









app.get('/', function(req, res) {
    res.render('login');
});







// app.get('/sucess', function(req, res) {
//     res.render('sucess');

// });
app.get('/sucess', function(request, response) {
    User.find({}, function(err, x){
    
      response.render('sucess', {users: x});
    
    });
    });








app.listen(8000, function() {
    console.log("listening on port 8000");
})























// var express = require('express');
// var mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/login_reg');
// const flash = require('express-flash');
// var session = require('express-session');
// const bcrypt = require('bcrypt');
// var app = express();
// const emailRegex = require('email-regex');

// var bodyParser = require('body-parser');

// app.use(flash());
// app.use(session({
//     secret: 'keyboardkitteh',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge: 60000 }
//   }))

// app.use(bodyParser.urlencoded({ extended: true }));
// var path = require('path');
// app.use(express.static(path.join(__dirname, './static')));
// app.set('views', path.join(__dirname, './views'));
// app.set('view engine', 'ejs');


// const UserSchema = new mongoose.Schema({
//     email:{type: String, required:[true,'please enter a valid email']},
//     first_name: {type:String, required:[true,'first_name is required']},
//     last_name: {type: String, required:[true,'last_name is required']},
//     password: {type: String, required:[true,'password is required']},
//     birthday: {type: Date, required:[true,'birthday is required']}
// },{timestamps: true})
// mongoose.model('User', UserSchema);
// const User = mongoose.model('User')

// app.post('/register',function(req,res){
//     console.log("POST DATA", req.body);

//     if(emailRegex().test(req.body.email)!=true){
//         req.flash('register', "email is not valid.");
//     //other validations here, including bcrypt for password
//     }
//     User.find({email:req.body.email},function(err,user){
//         if(err){
//             console.log('email not available');
//             res.redirect('/')
//         }
//         else if(user.length == 0){
//             console.log(user);
//             console.log('email available');
//         }
//         else{
//             console.log("email unavailable")
//             req.flash('register','email unavailable.');
//             // res.redirect('/')
//         }
//     })
//     if(req.body.pw.length < 5 || req.body.pw!= req.body.pwConfirm){
//         req.flash('register','passwords do not match.');
//         res.redirect('/')
//     }else{
//         bcrypt.hash(req.body.pw,10,function(err,hashed_pw){
//             if(err){

//             }else{
//                 var user = new User({email: req.body.email,
//                         first_name: req.body.first_name,
//                         last_name: req.body.last_name,
//                         password: hashed_pw,
//                         birthday: req.body.birthday});
//                 user.save(function(err){
//                     if(err){
//                         console.log("Failed to create user");
//                         for(var key in err.errors){
//                             req.flash('register', err.errors[key].message);
//                         }
//                         res.redirect('/')
//                     }else{
//                         console.log("Successfully created User")
                        
//                         User.findOne({email:req.body.email},function(err,user){
//                             if(err){
//                                 console.log("cannot retrieve user");
//                                 res.redirect('/');
//                             }
//                             else{
//                                 console.log(user)
//                                 req.session.email = user.email;
//                                 res.redirect('/welcome')
//                             }
//                         })
//                     }
//                 })
//             }
//         })
//     }
    
//     })

// app.post('/login',function(req,res){
//     console.log("POST DATA",req.body);
//     if(req.body.email == null){
//         console.log("null email");
//         req.flash('login','fields cant be empty');
//     }
//     if(req.body.pw == null){
//         console.log("null password");
//         req.flash('login',"All fields are required")
//     }
//     if(emailRegex().test(req.body.email)!=true){
//         console.log("incorrect email.");
//         req.flash('login',"incorrect email")
//         res.redirect('/')
//     }else{
//         User.findOne({email: req.body.email},function(err,user){
//             if(err){
//                 console.log("no user exists with that email");
//                 res.redirect('/');
//             }
//             else{
//                 bcrypt.compare(req.body.pw, user.password, function(err,validpw){
//                     if(err){
//                         console.log("error");
//                         res.redirect('/');                        
//                     }else if(validpw==false){
//                         console.log("incorrect password");
//                         req.flash('login', "incorrect password");
//                         res.redirect('/');     
//                     }else{
//                         console.log(user.email);
//                         req.session.email = user.email;
//                         res.redirect('/welcome');
//                     }
//                 })


//                 }
//             }
//         )}

// })
// app.get('/welcome',function(req,res){
//     User.findOne({email:req.session.email},function(err,user){
//         if(err){
//             console.log("cannot retrieve user");
//             res.redirect('/');
//         }
//         else{
//             res.render('welcome', {user:user})
//         }
//     })
// })

// app.get('/logout',function(req,res){
//     req.session.email = null;
//     console.log("logging out")
//     res.redirect('/')
// })

// app.get('/', function(req, res) {
//     res.render('index')
// })
  
// app.listen(8000, function() {
//     console.log("listening on port 8000");
// })