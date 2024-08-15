const {body} = require('express-validator')
const User = require('../models/user') 

exports.registerValidators = [
    body('email', 'Enter a valid email address!' )
        .isEmail()
        .custom(async (value, {req}) => {
            try {
                const user = await User.findOne({ email: value })
                if (user) {
                    return Promise.reject('This email is already taken!')
                }
            } catch (e) {
                console.log(e)
            }
        })
        .normalizeEmail(),
    body('password', 'Password must be a minimum of 6 characters!')
        .isLength({min: 6, max: 56})
        .trim(),
    body('confirm')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('The passwords must match!')
            }
            return true
        })
        .trim(),
    body('name', 'Name must be a minimum of 3 characters')
        .isLength({min: 3})
        .trim()
]

exports.loginValidators = [
    body('email', 'Enter a valid email address!')
        .isEmail()
        .custom(async (value) => {
            try {
                const user = await User.findOne({ email: value });
                if (!user) {
                    return Promise.reject('This user does not exist!');
                }
            } catch (e) {
                console.error(e);
                throw new Error('Server error while checking email!');
            }
        })
        .normalizeEmail(),
    body('password', 'Password must be a minimum of 6 characters!')
        .isLength({ min: 6, max: 56 })
        .trim()
];

exports.courseValidators = [
    body('title')
        .isLength({min: 3})
        .withMessage('Minimum name length 3 characters')
        .trim(),
    body('price', 'Enter the correct price')
        .isNumeric(),
    body('img', 'Enter the correct Url of the image')
        .isURL()
]