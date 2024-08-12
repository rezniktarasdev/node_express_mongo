const {Router} = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const User =  require('../models/user')
const router = Router()
const keys =  require('../keys/index')
const nodemailer = require('nodemailer')
const regEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')

const transporter = nodemailer.createTransport({
    host: keys.BREVO_SMTP_SERVER,
    port: keys.BREVO_SMTP_PORT,
    secure: false,
    auth: {
        user: keys.BREVO_SMTP_LOGIN,
        pass: keys.BREVO_SMTP_KEY,
    },
});


router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const candidate = await User.findOne({ email })

        if (candidate) {
        const areSame = await bcrypt.compare(password, candidate.password)

        if (areSame) {
            req.session.user = candidate
            req.session.isAuthenticated = true
            req.session.save(err => {
            if (err) {
                throw err
            }
            res.redirect('/')
            })
        } else {
            req.flash('loginError', 'Invalid password')
            res.redirect('/auth/login#login')
        }
        } else {
            req.flash('loginError', 'This user does not exist')
            res.redirect('/auth/login#login')
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/register', async (req, res) => {
    try {
        const { email, password, repeat, name } = req.body;
        const candidate = await User.findOne({ email });

        if (candidate) {
            req.flash('registerError', 'A user with this email already exists');
            return res.redirect('/auth/login#register');
        } 

        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email, name, password: hashPassword, cart: { items: [] }
        });

        await user.save();

        try {
            await transporter.sendMail(regEmail(email));
            console.log('Message sent');
        } catch (error) {
            console.error('Error sending email:', error);
        }

        res.redirect('/auth/login#login');

    } catch (e) {
        console.error(e);
        res.redirect('/auth/login#register');  // Додатково можна додати редирект або відображення помилки користувачеві
    }
});

router.get('/reset', (req, res) => {
    try {
        res.render('auth/reset', {
            title: 'Reset password',
            error: req.flash('error')
        })
    } catch (error) {
        console.log(error)
    }
})

router.post('/reset', async (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Something went wrong, try again later')

                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')
            const candidate = await User.findOne({email: req.body.email})

            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000

                await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token))

                res.redirect('/auth/login')
            } else {
                req.flash('error', 'This email does not exist')
                res.redirect('/auth/reset')
            }
        })
        } catch (e) {
            console.log(e)
        }
})

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
    }

    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if (!user) {
            return res.redirect('/auth/login')
        } else {
            res.render('auth/password', {
                title: 'Access restore',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            })
        }
    } catch (e) {
        console.log(e)
    }
})

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        })

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10)
            user.resetToken = undefined
            user.resetTokenExp = undefined

            await user.save()
            res.redirect('/auth/login')
        } else {
            req.flash('loginError', 'Token lifetime has expired')
            res.redirect('/auth/login')
        }
    } catch (e) {
        console.log(e)
    }
})

module.exports = router