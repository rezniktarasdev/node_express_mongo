const CSRF = require('csrf');
const csrf = new CSRF();

module.exports = function (req, res, next) {
    res.locals.isAuth = req.session.isAuthenticated;

    if (req.session && !req.session.csrfSecret) {
        req.session.csrfSecret = csrf.secretSync();
    }

    res.locals.csrfToken = csrf.create(req.session.csrfSecret);

    next();
};
