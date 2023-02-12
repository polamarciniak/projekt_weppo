const db = require('../db/db_services');

function getLogin(req, res) {
    if (req.session.logged) {
        res.redirect('/');
    } else {
        res.render('login');
    }
}

async function postLogin(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var userid = await db.login_user(username, password);
    var user = await db.get_user(userid);
    user = user[0];
    if (userid) {
        req.session.username = username;
        req.session.userid = userid;
        req.session.logged = true;
        req.session.isadmin = user.isadmin;
        req.session.successLogin = true;
        var redirect = '/';
        if (req.query.redirect) {
            redirect = req.query.redirect;
        }
        res.redirect(redirect);
    } else {
        res.render('login', { alert: { type: 'warning', message: 'Nieprawidłowy login lub hasło' } });
    }
}

function getRegister(req, res) {
    if (req.session.logged) {
        res.redirect('/');
    } else {
        res.render('register');
    }
}

async function postRegister(req, res) {
    var username = req.body.reg_username;
    var password = req.body.reg_password;
    var confirm_password = req.body.reg_password_confirm;
    if (password != confirm_password) {
        res.render('register', { alert: { type: 'warning', message: 'Hasła się nie zgadzają' } });
    } else {
        var success = await db.add_user(username, password, false);
        if (success) {
            req.session.userid = success;
            req.session.username = username;
            req.session.logged = true;
            req.session.successRegister = true;
            res.redirect('/');
        } else {
            res.render('register');
        }
    }
}

function logout(req, res) {
    delete req.session.logged;
    delete req.session.userid;
    delete req.session.username;
    delete req.session.isadmin;
    req.session.logout = true;
    res.redirect('/');
}

module.exports = {
    getLogin,
    postLogin,
    getRegister,
    postRegister,
    logout
}