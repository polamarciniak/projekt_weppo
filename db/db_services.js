const { pool } = require('./config');
var bcrypt = require('bcrypt');

async function encrypt(text) {
  var rounds = 12;
  var hash = await bcrypt.hash(text, rounds);
  return hash;
}

function disconnect() {
  pool.end();
}

async function get_user_id(username, password) {
  let query = `SELECT id, password FROM account WHERE username = $1;`;
  let args = [username];
  try {
    let res = await pool.query(query, args);
    if (res.rows[0]) {
      let r = await bcrypt.compare(password, res.rows[0].password);
      if(r) {
        return res.rows[0].id;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (err) {
    console.error('db get_user_id error');
    console.error(err);
  }
}

async function set_user_password(userid, password) {
  password = await encrypt(password);
  let query = 'UPDATE account SET password = $1 WHERE id = $2;';
  let args = [password, userid];
  try {
    await pool.query(query, args);
    return 2;
  } catch (err) {
    console.error('db set_user_password error');
    console.error(err);
  }
}

async function get_user(id) {
  var query = `SELECT id, username, isadmin, to_char(last_login, 'DD Mon YYYY') as last_login FROM account;`;
  var args = [];
  if (id) {
    query = `SELECT id, username, isadmin, to_char(last_login, 'DD Mon YYYY') as last_login FROM account WHERE id = $1;`;
    args = [id];
  }
  try {
    let res = await pool.query(query, args);
    return res.rows;
  } catch (err) {
    console.error('db get_user error');
    console.error(err);
  }
}

async function login_user(username, password) {
  try {
    let id = await get_user_id(username, password);
    if(id) {
      let query = `UPDATE account SET last_login = NOW() WHERE id = $1;`;
      await pool.query(query, [id]);
    }
    return id;
  } catch (err) {
    console.error('db login_user error');
    console.error(err);
  }
}

async function add_user(username, password, isadmin) {
  password = await encrypt(password);
  let query = `INSERT INTO account (id,username, password, isadmin, last_login)
              VALUES (DEFAULT,$1, $2, $3, NOW())
              RETURNING id;`;
  let query1 = `SELECT id FROM account WHERE username = $1;`;
  let args = [username, password, isadmin];
  try {
    let check_existence = await pool.query(query1, [username]);
    if (check_existence.rowCount) {
      return false;
    }
    let res = await pool.query(query, args);
    return res.rows[0].id;
  } catch (err) {
    console.error('db add_user error');
    console.error(err);
  }
}

async function set_admin(userid, isadmin) {
  let query = `UPDATE account SET isadmin = $1 WHERE id = $2;`;
  let args = [isadmin, userid];
  try {
    await pool.query(query, args);
    return true;
  } catch (err) {
    console.error('db set_admin error');
    console.error(err);
  }
}

async function add_category(description) {
  let query = `INSERT INTO category (description) VALUES ($1);`;
  try {
    await pool.query(query, [description]);
    return true;
  } catch (err) {
    console.error('db add_category error');
    console.error(err);
  }
}

async function add_size(description) {
  let query = `INSERT INTO size (description) VALUES ($1);`;
  try {
    await pool.query(query, [description]);
    return true;
  } catch (err) {
    console.error('db add_size error');
    console.error(err);
  }
}

async function add_colour(description) {
  let query = `INSERT INTO colour (description) VALUES ($1);`;
  try {
    await pool.query(query, [description]);
    return true;
  } catch (err) {
    console.error('db add_colour error');
    console.error(err);
  }
}

async function add_product(price, name, size, colour, amount, status, description, category) {
  let query = `INSERT INTO product (price, name, size, colour, amount, status, description, category)
              VALUES ($1 ::numeric::money, $2, $3, $4, $5, $6, $7, $8)
              RETURNING id;`;
  let args = [price, name, size, colour, amount, status, description, category];
  try {
    let res = await pool.query(query, args);
    return res.rows[0].id;
  } catch (err) {
    console.error('db add_product error');
    console.error(err);
  }
}

// eslint-disable-next-line no-unused-vars
async function edit_product(price, name, size, colour, status, description, category, prodid) {
  let query = `UPDATE product SET price = $1, name = $2, size = $3, colour = $4, amount = 1,
              status = $5, description = $6, category = $7 WHERE id = $8;`;
  let args = [...arguments];
  try {
    await pool.query(query, args);
    return true;
  } catch (err) {
    console.error('db edit_product error');
    console.error(err);
  }
}


async function set_product_status(prodid, status) {
  let query = `UPDATE product SET status = $1 WHERE id = $2;`;
  let args = [status, prodid];
  try {
    await pool.query(query, args);
    return true;
  } catch (err) {
    console.error('db set_product_status error');
    console.error(err);
  }
}

async function set_product_amount(prodid, amount) {
  let query = `UPDATE product SET amount = $1 WHERE id = $2;`;
  let args = [amount, prodid];
  try {
    await pool.query(query, args);
    return true;
  } catch (err) {
    console.error('db set_product_amount error');
    console.error(err);
  }
}

async function add_purchase_status(description) {
  let query = `INSERT INTO purchase_status (description) VALUES ($1);`;
  try {
    await pool.query(query, [description]);
    return true;
  } catch (err) {
    console.error('db add_purchase_status error');
    console.error(err);
  }
}

async function add_picture(prodid, filepath) {
  let query = `INSERT INTO picture (product, filepath)
              VALUES ($1, $2);`;
  let args = [prodid, filepath];
  try {
    await pool.query(query, args);
    return true;
  } catch (err) {
    console.error('db add_picture error');
    console.error(err);
  }
}

async function add_purchase(userid, status) {
  let query = `INSERT INTO purchase (userid, status)
              VALUES ($1, $2)
              RETURNING id;`;
  let args = [userid, status];
  try {
    let res = await pool.query(query, args);
    return res.rows[0].id;
  } catch (err) {
    console.error('db add_purchase error');
    console.error(err);
  }
}

async function add_sold_product(purchaseid, prodid, amount) {
  let query = `INSERT INTO sold_product (purchase_id, product_id, amount)
              VALUES ($1, $2, $3);`;
  let args = [purchaseid, prodid, amount];
  try {
    await pool.query(query, args);
    return true;
  } catch (err) {
    console.error('db add_sold_product error');
    console.error(err);
  }
}

async function set_purchase_status(purchaseid, status) {
  let query = `UPDATE purchase SET status = $1 WHERE id = $2;`;
  let args = [status, purchaseid];
  try {
    await pool.query(query, args);
    return true;
  } catch (err) {
    console.error('db set_purchase_status error');
    console.error(err);
  }
}

async function get_category(id) {
  var query = `SELECT * FROM category;`;
  var args = [];
  if (id) {
    query = 'SELECT * FROM category WHERE id = $1;';
    args = [id];
  }
  try {
    let res = await pool.query(query, args);
    return res.rows;
  } catch (err) {
    console.error('db get_category error');
    console.error(err);
  }
}

async function get_colour(id) {
  var query = `SELECT * FROM colour;`;
  var args = [];

  if (id) {
    query = `SELECT * FROM colour WHERE id = $1;`;
    args = [id];
  }

  try {
    let res = await pool.query(query, args);
    return res.rows;
  } catch (err) {
    console.error('db get_colour error');
    console.error(err);
  }
}

async function get_picture(prodid, id) {
  var query = `SELECT * FROM picture WHERE product = $1;`;
  var args = [prodid];

  if (id) {
    query = `SELECT * FROM picture WHERE id = $1;`;
    args = [id];
  }

  try {
    let res = await pool.query(query, args);
    return res.rows;
  } catch (err) {
    console.error('db get_picture error');
    console.error(err);
  }
}

async function get_described_purchase(userid, id) {
  var query = `SELECT purchase.userid as userid, purchase.id, purchase_status.description as status, tmp1.price as sum
              FROM purchase JOIN purchase_status ON purchase.status = purchase_status.id
              JOIN (SELECT sold_product.purchase_id, sum(sold_product.amount * product.price) as price
              FROM sold_product JOIN product ON sold_product.product_id = product.id
              GROUP BY sold_product.purchase_id) as tmp1 ON purchase.id = tmp1.purchase_id
              ORDER BY purchase.id ASC;`;
  var args = [];
  if(userid) {
    query = `SELECT purchase.userid as userid, purchase.id, purchase_status.description as status, tmp1.price as sum
            FROM purchase JOIN purchase_status ON purchase.status = purchase_status.id
            JOIN (SELECT sold_product.purchase_id, sum(sold_product.amount * product.price) as price
            FROM sold_product JOIN product ON sold_product.product_id = product.id
            GROUP BY sold_product.purchase_id) as tmp1 ON purchase.id = tmp1.purchase_id
            WHERE purchase.userid = $1
            ORDER BY purchase.id ASC;`;
    args = [userid];
  }
  if(id) {
    query = `SELECT purchase.userid as userid, purchase.id, purchase_status.description as status, tmp1.price as sum
            FROM purchase JOIN purchase_status ON purchase.status = purchase_status.id
            JOIN (SELECT sold_product.purchase_id, sum(sold_product.amount * product.price) as price
            FROM sold_product JOIN product ON sold_product.product_id = product.id
            GROUP BY sold_product.purchase_id) as tmp1 ON purchase.id = tmp1.purchase_id
            WHERE purchase.id = $1
            ORDER BY purchase.id ASC;`;
    args = [id];
  }
  try {
    let res = await pool.query(query, args);
    return res.rows;
  } catch (err) {
    console.error('db get_described_purchase error');
    console.error(err)
  }
}

async function get_purchase(userid, id) {
  var query = "";
  var args = [];
  if (id) {
    query = `SELECT * FROM purchase WHERE id = $1;`;
    args = [id];
  } else {
    if (userid) {
      query = `SELECT * FROM purchase WHERE userid = $1;`;
      args = [userid];
    } else {
      query = `SELECT * FROM purchase;`;
      args = [];
    }
  }
  try {
    let res = await pool.query(query, args);
    return res.rows;
  } catch (err) {
    console.error('db get_purchase error');
    console.error(err);
  }
}

async function get_purchase_status(id) {
  var query = `SELECT * FROM purchase_status;`;
  var args = [];

  if (id) {
    query = `SELECT * FROM purchase_status WHERE id = $1;`;
    args = [id];
  }

  try {
    let res = await pool.query(query, args);
    return res.rows;
  } catch (err) {
    console.error('db get_purchase_status error');
    console.error(err);
  }
}

async function get_size(id) {
  var query = `SELECT * FROM size;`;
  var args = [];

  if (id) {
    query = `SELECT * FROM size WHERE id = $1;`;
    args = [id];
  }

  try {
    let res = await pool.query(query, args);
    return res.rows;
  } catch (err) {
    console.error('db get_size error');
    console.error(err);
  }
}

async function get_sold_product(purchaseid) {
  var query = `SELECT * FROM sold_product;`;
  var args = [];

  if (purchaseid) {
    query = `SELECT * FROM sold_product WHERE purchase_id = $1;`;
    args = [purchaseid];
  }

  try {
    let res = await pool.query(query, args);
    return res.rows;
  } catch (err) {
    console.error('db get_sold_product error');
    console.error(err);
  }
}

async function get_product(id) {
  var query = `SELECT * FROM product;`;
  var args = [];

  if (id) {
    query = `SELECT * FROM product WHERE id = $1;`;
    args = [id];
  }

  try {
    let res = await pool.query(query, args);
    return res.rows;
  } catch (err) {
    console.error('db get_product error');
    console.error(err);
  }
}

async function get_full_product(id){
  var query = `SELECT p.id as id, price, name, ca.description as category,
    c.description as colour, s.description as size, p.description as description,
    amount, status, c.id as colour_id, ca.id as category_id, s.id as size_id
    FROM product as p
    JOIN colour as c ON p.colour = c.id
    JOIN size as s ON p.size = s.id
    JOIN category as ca ON p.category = ca.id`;
  var args = [];
  if(id){
    query += ' WHERE p.id = $1';
    args = [id];
  }
  query+=';';

  try {
    let res = await pool.query(query, args);
    return res.rows;
  } catch (err) {
    console.error('db get_full_product error');
    console.error(err);
  }

}

async function get_full_sold_product(purchaseid) {
  var query = `SELECT purchase.id as id, product.id as product_id, product.price as price, product.name as name, sold_product.amount as amount, size.description as size, colour.description as colour, category.description as category
  FROM purchase JOIN sold_product ON purchase.id = sold_product.purchase_id
  JOIN product ON product.id = sold_product.product_id
  JOIN size ON product.size = size.id
  JOIN colour ON product.colour = colour.id
  JOIN category ON product.category = category.id`;
  var args = [];
  if(purchaseid) {
    query += ' WHERE purchase.id = $1';
    args = [purchaseid];
  }
  query += ';';
  try {
    let res = await pool.query(query, args);
    return res.rows;
  } catch (err) {
    console.error('db get_full_sold_product error');
    console.error(err);
  }
}

module.exports = {
  disconnect,
  get_user_id,
  login_user,
  add_user,
  set_admin,
  add_category,
  add_size,
  add_colour,
  add_product,
  set_product_status,
  set_product_amount,
  add_purchase_status,
  add_picture,
  add_purchase,
  add_sold_product,
  set_purchase_status,
  get_category,
  get_colour,
  get_picture,
  get_purchase,
  get_purchase_status,
  get_size,
  get_sold_product,
  get_product,
  get_user,
  get_full_product,
  set_user_password,
  get_described_purchase,
  get_full_sold_product,
  edit_product
}
