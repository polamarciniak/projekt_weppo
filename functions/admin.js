const fs = require('fs').promises;
const db = require('../db/db_services');

async function get(req, res) {
    let categories = await db.get_category();
    let sizes = await db.get_size();
    let colours = await db.get_colour();
    res.render('admin_panel', {username: req.session.username, categories: categories, sizes: sizes, colours: colours});
}

async function add_category(req, res) {
    let desc = req.body.new_category;
    let success = await db.add_category(desc);
    if(success) {
      req.session.customAlert = { type: 'success', message: 'Dodano nową kategorię' };
    } else {
      req.session.customAlert = { type: 'danger', message: 'Ups! Coś poszło nie tak' };
    }
    res.redirect('/admin');
}

async function add_size(req, res) {
    let desc = req.body.new_size;
    let success = await db.add_size(desc);
    if(success) {
        req.session.customAlert = { type: 'success', message: 'Dodano nowy rozmiar' };
    } else {
        req.session.customAlert = { type: 'danger', message: 'Ups! Coś poszło nie tak' };
    }
    res.redirect('/admin');
}

async function add_colour(req, res) {
    let desc = req.body.new_colour;
    let success = await db.add_colour(desc);
    if(success) {
        req.session.customAlert = { type: 'success', message: 'Dodano nowy kolor' };
    } else {
        req.session.customAlert = { type: 'danger', message: 'Ups! Coś poszło nie tak' };
    }
    res.redirect('/admin');
}

async function get_users(req, res) {
    let users = await db.get_user();
    res.render('admin-users', {users: users});
}

async function get_products(req, res) {
    let prods = await db.get_full_product();
    res.render('admin-products', {products: prods});
}

async function change_status(req, res) {
    let prodid = req.params.id;
    let prod = await db.get_product(prodid);
    let newstatus = !prod[0].status;
    let success = await db.set_product_status(prodid, newstatus);
    if(success) {
        req.session.customAlert = { type: 'success', message: 'Zmieniono status produktu' };
    } else {
        req.session.customAlert = { type: 'danger', message: 'Ups! Coś poszło nie tak' };
    }
    res.redirect('/admin/products');
}

async function get_orders(req, res) {
    let orders = await db.get_described_purchase();
    res.render('admin-orders', {orders: orders});
}

async function get_user(req, res) {
    let user = await db.get_user(req.params.id);
    user = user[0];
    let orders = await db.get_described_purchase(user.id);
    res.render('admin_user', {user: user, orders: orders});
}

async function change_user_status(req, res) {
    let userid = req.params.id;
    let new_status = req.body.new_status;
    if(new_status > 0){
      var success = await db.set_admin(userid, new_status == 2)
    }
    if(success) {
        req.session.customAlert = { type: 'success', message: 'Zmieniono status użytkownika' };
    } else {
        req.session.customAlert = { type: 'danger', message: 'Ups! Coś poszło nie tak' };
    }
    res.redirect('/admin/user/'+userid);
}

async function get_order(req, res) {
    let order = await db.get_described_purchase('', req.params.id);
    order = order[0];
    let prods = await db.get_full_sold_product(order.id);
    let user = await db.get_user(order.userid);
    let order_status = await db.get_purchase_status();
    user = user[0];
    res.render('admin_order_view', {order: order, products: prods, user: user, order_status: order_status});
}

async function change_order_status(req, res) {
    let orderid = req.params.id;
    let new_status = req.body.new_status;
    if(new_status > 0){
      var success = await db.set_purchase_status(orderid, new_status);
    }
    if(success) {
        req.session.customAlert = { type: 'success', message: 'Zmieniono status zamówienia' };
    } else {
        req.session.customAlert = { type: 'danger', message: 'Ups! Coś poszło nie tak' };
    }
    res.redirect('/admin/order/'+orderid);
}

async function get_product(req, res) {
    let [product] = await db.get_full_product(req.params.id);
    let categories = await db.get_category();
    let colours = await db.get_colour();
    let sizes = await db.get_size();
    res.render('admin-product', {product, categories, colours, sizes});
}

async function edit_product(req, res) {
    let prodid = req.params.id;
    let name = req.body.new_name;
    let price = req.body.new_price;
    let size = req.body.new_size;
    let category = req.body.new_category;
    let colour = req.body.new_colour;
    let status = req.body.new_status;
    let desc = req.body.new_description;

    const success = await db.edit_product(price, name, size, colour, status, desc, category, prodid);
    if(success){
        try {
            if(req.file){
                await fs.rename(`./public/uploads/${req.file.filename}`, `./public/uploads/${prodid}.jpg`);
            }
            req.session.customAlert = { type: 'success', message: 'Pomyślnie edytowano produkt' };
        } catch (err){
            req.session.customAlert = { type: 'warning', message: 'Edytowano, ale nastąpił błąd w dodaniu zdjęcia' };
        }
    }else{
        req.session.customAlert = { type: 'danger', message: 'Błąd podczas edytowania produktu' };
    }

    res.redirect(req.url);
}

async function add_product_page(req, res) {
    let categories = await db.get_category();
    let colours = await db.get_colour();
    let sizes = await db.get_size();
    res.render('admin-add-product',{categories, colours, sizes});
}

async function add_product(req, res) {
    let name = req.body.new_name;
    let price = req.body.new_price;
    let size = req.body.new_size;
    let category = req.body.new_category;
    let colour = req.body.new_colour;
    let status = req.body.new_status;
    let desc = req.body.new_description;
    let pic = req.file.filename;

    const id = await db.add_product(price, name, size, colour, 1, status, desc, category)
    if (id) {
        try{
            await fs.rename(`./public/uploads/${pic}`, `./public/uploads/${id}.jpg`);
            req.session.customAlert = { type: 'success', message: 'Pomyślnie dodano produkt' };
        }catch(err){
            req.session.customAlert = { type: 'warning', message: 'Dodano produkt, ale nastąpił błąd w dodaniu zdjęcia' };
        }
        res.redirect(`/admin/product/${id}`);
    } else {
        req.session.customAlert = { type: 'danger', message: 'Błąd podczas dodawania produktu' };
        res.redirect('/admin/addProduct');
    }
}


module.exports = {
    get,
    add_category,
    add_size,
    add_colour,
    get_users,
    get_products,
    change_status,
    get_orders,
    get_user,
    change_user_status,
    get_order,
    change_order_status,
    get_product,
    edit_product,
    add_product_page,
    add_product
}