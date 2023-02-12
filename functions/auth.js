function user(req, res, next) {
    if (req.session.logged) {
        next();
    } else {
        req.session.customAlert = { type: 'danger', message: 'By przejść do żądanej strony, musisz się zalogować.' };
        res.redirect('/login?redirect=' + req.url);
    }
}

function admin(req, res, next) {
  if(req.session.logged && req.session.isadmin) {
      next();
  } else {
      req.session.customAlert = { type: 'danger', message: 'By przejść do żądanej strony, musisz być zalogowany jako administrator.' };
      res.redirect('/login?redirect=' + req.url);
  }
}

module.exports = {
    user,
    admin
}