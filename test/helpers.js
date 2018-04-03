/**
 * Signs up a new User using /auth/signup and returns a token
 */
exports.signUp = function(app, request) {
  const userPayload = {
    nickname: 'Test User',
    email: 'example@email.com',
    password: 'TestPassworD+1'
  };
  return new Promise((resolve, reject) => {
    request(app)
      .post('/auth/signup')
      .send(userPayload)
      .expect(201)
      .end((err, res) => {
        if (err) throw err;

        console.log(`New user signed up. Token: ${res.body.jwtToken}\n`);
        resolve({ userPayload, token: res.body.jwtToken });
      });
  });
};
