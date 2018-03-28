module.exports = function Login(request, app) {
  return new Promise((resolve, reject) => {
    request(app)
      .post('/auth/signup')
      .type('form')
      .send({ email: 'test@patrykb.pl', password: 'Typical#Password' })
      .expect(201)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        const token = res.body.jwtToken;
        
        request(app)
          .get('/auth/me')
          .expect(200)
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
            const user = res.body.user;

            resolve({ token, user });
          });
      });
  });
};
