const db = require('../db/db_services');

async function get(req, res) {
    var alert = false;
    if (req.session.pass_change) {
        alert = { type: 'warning', message: 'Wpisano niepoprawne dane' };
        if (req.session.pass_change == 2) {
            alert = { type: 'success', message: 'Zmieniono hasło' };
        }
        delete req.session.pass_change;
    }
    let orders_list = await db.get_described_purchase(req.session.userid);
    res.render('account', { username: req.session.username, alert, orders_list: orders_list });
}

async function changePassword(req, res) {
    var old_pass = req.body.old_pass;
    var new_pass = req.body.new_pass;
    var repeat_pass = req.body.repeat_pass;
    var userid = await db.get_user_id(req.session.username, old_pass);
    var success = 1;
    if (new_pass == repeat_pass) {
        success = await db.set_user_password(userid, new_pass);
    }
    req.session.pass_change = success;
    res.redirect('/account');
}

async function order(req, res) {
    var id = req.params.id;
    var userid = req.session.userid;
    var purchase = await db.get_purchase(userid, id);
    purchase = purchase[0];
    if(purchase && (userid == purchase.userid || req.session.isadmin)) {
        var status = await db.get_purchase_status(purchase.status);
        var prods = await db.get_full_sold_product(id);
        res.render('order_view', {id: id, status: status[0].description, product_list: prods})
    } else {
        req.session.customAlert = { type: 'danger', message: 'Nie masz uprawnień by wyświetlić tę stronę' };
        res.redirect('/');
    }
}

module.exports = {
    get,
    changePassword,
    order
}