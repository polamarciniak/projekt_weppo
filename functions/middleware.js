function checksession(req, res, next) {
    res.locals.logged = req.session.logged;
    res.locals.isadmin = req.session.isadmin;
    if (!req.session.basket) {
        req.session.basket = {};
        req.session.basketinfo = {};
        req.session.basketlength = 0;
    }
    res.locals.basketlength = req.session.basketlength;

    if (req.session.successLogin) {
        res.locals.alert = { type: 'success', message: 'Zalogowano pomyślnie' };
        delete req.session.successLogin;
    }
    if (req.session.successRegister) {
        res.locals.alert = { type: 'success', message: 'Zarejestrowano pomyślnie' };
        delete req.session.successRegister;
    }
    if (req.session.logout) {
        res.locals.alert = { type: 'success', message: 'Wylogowano pomyślnie' };
        delete req.session.logout;
    }
    if (req.session.customAlert) {
        res.locals.alert = req.session.customAlert;
        delete req.session.customAlert;
    }
    next();
}

module.exports = {
    checksession
}