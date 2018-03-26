module.exports = function Login(request, app) {
  return new Promise((resolve, reject) => {
    request(app)
      .post('/auth/signin')
      .type('form')
      .send({ email: 'test@patrykb.pl', password: 'Typical#Password' })
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res.body.jwtToken);
      });
  });
};
