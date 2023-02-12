const db = require('../db/db_services');

function get(req, res) {
    let products_in_basket = [];
    let bi = req.session.basketinfo;
    let b = req.session.basket;
    Object.keys(bi).map((key) => {
        products_in_basket.push({ item: bi[key], amount: b[key].amount });
    })
    res.render('basket', { basket: products_in_basket });
}


async function add(req, res) {
    var id = Number(req.body.txtParam);
    req.session.basketlength += 1;
    if (req.session.basket[id]) {
        req.session.basket[id].amount += 1;
    } else {
        req.session.basket[id] = { amount: 1 };
        let full_prod = await db.get_full_product(id);
        req.session.basketinfo[id] = full_prod[0];
    }
    res.json({ success: "Updated Successfully", status: 200, productName: req.session.basketinfo[id].name });
}

function remove(req, res) {
    var id = parseInt(req.params.id);
    if (req.session.basket && req.session.basket[id]) {
        req.session.basketlength -= 1;
        req.session.basket[id].amount -= 1;
        if (req.session.basket[id].amount < 1) {
            delete req.session.basket[id];
            delete req.session.basketinfo[id];
        }
    }
    res.redirect('/basket');
}

function clear(req, res) {
    delete req.session.basket;
    delete req.session.basketinfo;
    res.redirect('/');
}

async function checkout_get(req, res) {
    if(req.session.basketlength == 0) {
      res.redirect('/');
    } else {
      let sum = 0;
      let bi = req.session.basketinfo;
      let b = req.session.basket;
      Object.keys(bi).map((key) => {
        sum += bi[key].price * b[key].amount;
      })
      sum = Math.round(sum*100) / 100;
      res.render('checkout', {sum: sum});
    }
}

async function checkout_post(req, res) {
    if(req.body.payment_method == 0) {
      req.session.customAlert = { type: 'danger', message: 'Wybierz formę płatności' };
      res.redirect('/checkout');
    } else {
      if(req.session.logged) {
        var userid = req.session.userid;
      } else {
        userid = 1;
      }
      let id = await db.add_purchase(userid, 1);
      let bi = req.session.basketinfo;
      let b = req.session.basket;
      Object.keys(bi).map(async (key) => {
          await db.add_sold_product(id, bi[key].id,  b[key].amount);
      })
      // Do something with shipping information
      req.session.customAlert = { type: 'success', message: 'Dziękujemy za zakupy!' };
      clear(req, res);
    }
}

module.exports = {
    get,
    add,
    remove,
    clear,
    checkout_post,
    checkout_get
}
