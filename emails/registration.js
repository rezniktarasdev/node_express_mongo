const keys = require('../keys/index');

module.exports = function (email) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Account created',
    html: `
      <h1>Welcome to our shop</h1>
      <p>Congratulations! You have successfully created an account with email - ${email}</p>
      <hr />
      <a href="${keys.BASE_URL}">Shop courses</a>
    `,
  };
};
