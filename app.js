const express = require('express');
const session = require('express-session');
const ash = require('express-async-handler');
const http = require('http');
const path = require('path');
const multer = require('multer');

const { checksession } = require('./functions/middleware');
const basket = require('./functions/basket');
const auth = require('./functions/auth');
const user = require('./functions/user');
const product = require('./functions/product');
const account = require('./functions/account');
const admin = require('./functions/admin');

const app = express();
const upload = multer({ dest: './public/uploads/'});
app.use(session({
    secret: 'weppoweppo',
    resave: true,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));


app.use(checksession);

app.get('/', (req, res) => {
    res.render('index');
});

//user
app.get('/login', user.getLogin);

app.post('/login', ash(user.postLogin));

app.get('/register', user.getRegister);

app.post('/register', ash(user.postRegister));

app.get('/logout', user.logout);


//basket
app.get('/basket', basket.get);

app.post('/api/add2basket', upload.single(), ash(basket.add));

app.get('/api/remove/:id(\\d+)', basket.remove);

app.get('/clearbasket', basket.clear);

app.get('/checkout', ash(basket.checkout_get));

app.post('/checkout/finalize', ash(basket.checkout_post));

//products
app.get('/product/:id(\\d+)', ash(product.get));

app.get('/listing', ash(product.list));

//account
app.get('/account', auth.user, ash(account.get));

app.post('/account/changepassword', auth.user, ash(account.changePassword));

app.get('/order/:id(\\d+)', auth.user, ash(account.order));

//admin
app.get('/admin', auth.admin, ash(admin.get));

app.post('/admin/addCategory', auth.admin, ash(admin.add_category));

app.post('/admin/addSize', auth.admin, ash(admin.add_size));

app.post('/admin/addColour', auth.admin, ash(admin.add_colour));

app.get('/admin/users', auth.admin, ash(admin.get_users));

app.get('/admin/products', auth.admin, ash(admin.get_products));

app.get('/admin/changeStatus/:id(\\d+)', auth.admin, ash(admin.change_status));

app.get('/admin/orders', auth.admin, ash(admin.get_orders));

app.get('/admin/user/:id(\\d+)', auth.admin, ash(admin.get_user));

app.post('/admin/changeUserStatus/:id(\\d+)', auth.admin, ash(admin.change_user_status));

app.get('/admin/order/:id(\\d+)', auth.admin, ash(admin.get_order));

app.post('/admin/changeOrderStatus/:id(\\d+)', auth.admin, ash(admin.change_order_status));

app.get('/admin/product/:id(\\d+)', auth.admin, ash(admin.get_product));

app.get('/admin/addProduct', auth.admin, ash(admin.add_product_page));

app.post('/admin/addProduct', auth.admin, upload.single('new_pic'), ash(admin.add_product));

app.post('/admin/product/:id(\\d+)', auth.admin, upload.single('new_pic'), ash(admin.edit_product));

// 404
app.get('/404', (req, res) => {
    res.status(404).render('404');
});

app.get('*', (req, res) => {
    res.redirect('/404');
});


http.createServer(app).listen(process.env.PORT || 8080);
console.log('Server started');