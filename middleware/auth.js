const User = require('../models/user');

module.exports = async function (req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/login');
    }

    try {
        const user = await User.findById(req.session.user._id);

        if (!user) {
            return res.redirect('/auth/login');
        }
        req.user = user;

        next();
    } catch (err) {
        console.error(err);
        res.redirect('/auth/login');
    }
};
