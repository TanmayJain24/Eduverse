var express = require('express');
var router = express.Router();
const userModel = require("./users");
const courseModel = require("./courses");
const passport = require('passport');
const upload = require('./multer');

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

function isLoggedIn(req, res, next) { 
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}   

router.get('/', function(req, res){
    res.render('index', { user: req.user });
});

router.get('/index', function(req, res){
  res.render('index', { user: req.user });
});

router.get('/profile', isLoggedIn, async function(req, res){
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user
    })
    .populate("courses");
    console.log(user);
    res.render('profile', { user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).send('Server Error');
  }
});

router.get('/about', function(req, res){
  res.render('about', { user: req.user });
});

router.get('/contact', function(req, res){
  res.render('contact', { user: req.user });
});

router.get('/courses', async function(req, res){
  try {
    const courses = await courseModel.find();
    res.render('courses', { user: req.user, courses: courses });
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).send('Server Error');
  }
});

router.get('/signup', function(req, res){
  res.render('signup', { user: req.user });
});

router.post("/signup",upload.single('dp') , function (req, res) {
  const userdata = new userModel({
    fullname: req.body.fullname,
    username: req.body.username,
    email: req.body.email,
    dob: req.body.dob,
    gender: req.body.gender,
    dp: req.file ? req.file.filename : null,
  });

  userModel.register(userdata, req.body.password)
    .then(function (registereduser) { 
      passport.authenticate("local") (req, res, function (){
        res.redirect("/profile"); 
      });
    })
    .catch(function(err){
      res.status(500).send(err.message);
    })
});

router.get('/addcourse', isLoggedIn, function(req, res){
  res.render('addcourse', { user: req.user });
});

router.post('/joinnow', isLoggedIn, async function(req, res){
  const userId = req.user._id;
  const { courseId } = req.body;

  try {
    const user = await userModel.findById(userId);
    const courses = await courseModel.findById(courseId);

    if (!user || !courses) {
      return res.status(404).json({ error: 'User or Course not found' });
    }

    // Add course to user's courses array if not already added
    if (!user.courses.includes(courseId)) {
      user.courses.push(courseId);
      await user.save();
    }
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post("/addcourse",upload.single('image') , async function (req, res) {
  const coursedata = new courseModel({
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    mentorName: req.body.mentorName,
    duration: req.body.duration,
    starRating: req.body.starRating,
    image: req.file ? req.file.filename : null,
    });
    try {
      await coursedata.save();
        res.redirect('/courses');
    } catch (err) {
      res.status(500).send(err.message);
    }
});

router.post('/uploadImage', upload.single("image") , function(req, res, next){
  if (!req.image) {
    return res.status(400).send('No files were uploaded.'); 
  }
  res.send('File uploaded successfully!'); 
});

router.post('/upload', upload.single("dp") , function(req, res, next){
  // Handle file upload
  if (!req.dp) {
    return res.status(400).send('No files were uploaded.'); 
  }
  res.send('File uploaded successfully!'); 
});

router.get('/login', function(req, res, next){
  res.render('login', {error: req.flash('error')});
});
 
router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true,
}), function (req, res) {});

router.get("/logout", function(req, res, next) {
  req.logout(function(err) {
    if (err) return next(err);
    res.redirect('/');
  })
});

module.exports = router;