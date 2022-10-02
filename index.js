const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyparser = require('body-parser');
const path = require('path');
const User = require('./models/user');
const Plan = require('./models/plan');
const config = require('config');

const dbConfig = config.get('adityarajsahu.dbConfig.dbName');

mongoose.connect('mongodb+srv://adityarajsahu:4G6ueU9qSFtwMNku@cluster0.tcrdocg.mongodb.net/?retryWrites=true&w=majority', {useNewUrlParser: true}).then(
    () => {
        console.log("MONGO CONNECTION OPEN!!!")
    }).catch(
        err => {
            console.log("OH NO MONGO CONNECTION ERROR!!!")
            console.log(err)
        }
    )

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(session({secret: 'notagoodsecret'}));
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

const PUBLISHABLE_KEY = "pk_test_51LoMOTSFfvdGasvpgDJNNglCFC47zgLY6IYJBRlKTU4blWHzaOeGIDx4Xw0BUkDUgLlE8tNkciEPog2fFy2ZdxSs00XF5juBQF";

const SECRET_KEY = "sk_test_51LoMOTSFfvdGasvptiJmaeGtHs70EFQFA7UHPh4q6DSCyMUXiOFALH4FQibqizKCjSRNe2EIccXBWrFES8sJZOU8006Q9IWjCh";

const stripe = require('stripe')(SECRET_KEY);
app.use(express.static('public'));
const YOUR_DOMAIN = 'http://localhost:3000';

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const user = new User({
        name,
        email,
        password
    });
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/plan');
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const foundUser = await User.findAndValidate(email, password);

    if(foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/plan');
    } else {
        res.redirect('/login');
    }
})

app.post('/logout', (req, res) => {
    // req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login')
})

app.get('/plan', (req, res) => {
    if(!req.session.user_id) {
        return res.redirect('/login');
    }
    // res.render('plan')
    Plan.find({}).then((blogs) => {
        res.render('plan', {arr : blogs});
    }).catch((error) => {
        res.status(500).send(error);
    })
})

let cost = 0;

app.post('/plan', (req, res) => {
    const val = req.body;
    cost = val['monthly-price'] ? val['monthly-price'] : val['annual-price'];
    // console.log(amount);
    res.render('card', {amt : cost, key : PUBLISHABLE_KEY});
}) 

app.post('/payment', async (req, res) => {
    // console.log(req.body);
    res.redirect('confirm');
})

app.get('/confirm', (req, res) => {
    res.render('confirm')
})

let server_port = process.env.YOUR_PORT || process.env.PORT || 3000;

app.listen(server_port, () => {
    console.log(`Listening on port ${server_port}`);
})
