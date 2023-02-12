const { pool } = require('./config');
const db = require('./db_services');
const fs = require('fs');

var clear_query = fs.readFileSync('db/clear.sql').toString();
var init_query = fs.readFileSync('db/init.sql').toString();

async function clear() {
    try {
        await pool.query(clear_query);
        console.log('[admin] db clear success')
    } catch (err) {
        console.error('[admin] db clear error');
        console.error(err);
    }
}

async function init() {
    try {
        await pool.query(init_query);
        console.log('[admin] db init success')
    } catch (err) {
        console.error('[admin] db clear error');
        console.error(err);
    }
}

async function generate() {
    await db.add_user('admin', 'admin', true);
    await db.add_user('user1', 'user1', false);
    await db.add_user('user2', 'userd2', false);

    await db.add_category('Kosiarka elektryczna');
    await db.add_category('Kosiarka spalinowa');
    await db.add_category('kategoria traktorowa');

    await db.add_size('rozmiar 1');
    await db.add_size('rozmiar 2');
    await db.add_size('rozmiar 3');

    await db.add_colour('kolor 1');
    await db.add_colour('kolor 2');
    await db.add_colour('kolor 3');

    await db.add_product(100.99, 'Kosiarka elektryczna', 1, 1, 30, true, 'To jest przykład kosiarki elektrycznej', 1);
    await db.add_product(15.99, 'Kosiarka spalinowa', 2, 2, 50, true, 'To jest przykład kosiarki spalinowej', 2);
    await db.add_product(20.99, 'Kosiarka traktorowa', 3, 3, 70, true, 'To jest przykład kosiarki traktorowej', 3);

    await db.add_purchase_status('status zamówienia 1');
    await db.add_purchase_status('status zamówienia 2');
    await db.add_purchase_status('status zamówienia 3');

    await db.add_purchase(1, 1);
    await db.add_purchase(3, 2);
    await db.add_purchase(2, 3);

    await db.add_sold_product(1, 1, 2);
    await db.add_sold_product(1, 2, 5);
    await db.add_sold_product(2, 3, 10);
    await db.add_sold_product(3, 1, 1);
    await db.add_sold_product(3, 3, 15);

    console.log('[admin] db data generate success')
}

(async() => {
    await clear();
    await init();
    await generate();
})();