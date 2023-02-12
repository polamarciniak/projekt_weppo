const db = require('../db/db_services');

async function get(req, res) {
    var id = req.params.id;
    const [product] = await db.get_full_product(id);
    res.render('product', { product });
}

async function list(req, res) {
    var search = req.query.search;
    var id = req.query.id
    const result = await db.get_product();
    var listing = result;
    var active = null;
    if (id) {
        listing = listing.filter(pr => pr.category == id);
        active = id;
    }
    if (search) {
        listing = listing.filter(pr => pr.name.toLowerCase().includes(search.toLowerCase()));
    }
    const categories = await db.get_category();
    res.render('listing', { listing, categories, active, search });
}

module.exports = {
    get,
    list
}