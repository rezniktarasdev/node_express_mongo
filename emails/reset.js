const keys = require('../keys');

module.exports = function (email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Access restore',
        html: `
            <h1>Did you forget your password?</h1>
            <p>If not, please ignore this letter</p>
            <p>Otherwise, click on the link below:</p>
            <p><a href="${keys.BASE_URL}/auth/password/${token}">Restore access</a></p>
            <hr />
            <a href="${keys.BASE_URL}">Course Shop</a>
        `,
    };
};

