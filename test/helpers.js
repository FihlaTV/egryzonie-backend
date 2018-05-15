const faker = require('faker');

function randomizr(arr, single = true) {
  if (!Array.isArray(arr)) throw new Error('first argument must be an array');
  if (single) {
    return arr[Math.floor(Math.random() * arr.length) + 1];
  }
  return arr.filter((item) => Math.random() > 0.49);
}


/**
 * Signup a single user and return JWT token
 * @param {object} app        An app object to refer to when performing requests
 * @param {object} request    Supertest instance
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

/**
 * Create a collection of example users, ensureing at least one of them is an admin.
 * @param {object} mongoose A mongoose object
 */
exports.createUsers = async function(mongoose) {
  const User = mongoose.model('users');
  const exampleUsers = [];
  for (let i = 0; i < 4; i++) {
    exampleUsers.push(new User({
      Nickname: faker.internet.userName(),
      Email: faker.internet.email(),
      Password: faker.internet.password(),
      Role: ['user', 'moderator', 'admin'][Math.floor(Math.random() * 3) + 1]
    }));
  }

  // Ensure at least one admin
  if (!exampleUsers.find(u => u.Role === 'admin')) {
    exampleUsers[0].Role = 'admin';
  }

  return User.insertMany(exampleUsers);
};

/**
 * Create a collection of veterinary care places
 * @param {object} mongoose
 * @param {object} users
 */
exports.createVets = function(mongoose, users) {
  const Vet = mongoose.model('vets');

  const exampleVets = [
    new Vet({
      GoogleMapsID: 'ChIJQ8EgpGpDBEcR1d0wYZTGPbI',
      Position: [ 52.458631, 16.905277 ],
      Name: 'Centrum Zdrowia Małych Zwierząt',
      Address: 'Osiedle Władysława Jagiełły 33, 60-694 Poznań',
      Rodents: true,
      ExoticAnimals: true,
      WebsiteURL: 'http://www.klinikawet.pl/',
      Phone: '61 824 31 77',
      Accepted: true,
      AcceptedDate: new Date('01/01/2016'),
      SuggestedBy: randomizr(users),
      AcceptedBy: users.find(u => u.Role === 'admin')
    }),
    new Vet({
      GoogleMapsID: 'ChIJqzOyrPj7H0cRuNJG3u1SvGk',
      Position: [ 53.122827, 23.152517 ],
      Name: 'Przychodnia Małych Zwierząt',
      Address: 'Wesoła 16, 15-306 Białystok',
      Rodents: true,
      ExoticAnimals: true,
      WebsiteURL: 'http://www.xn--przychodniazwierzt-ycc.pl/',
      Phone: '85 742 38 00',
      Accepted: true,
      AcceptedDate: new Date('01/01/2016'),
      SuggestedBy: randomizr(users),
      AcceptedBy: users.find(u => u.Role === 'admin')
    }),
    new Vet({
      GoogleMapsID: 'ChIJGZF6IAj7PEcRuvpLFvLUIXI',
      Position: [ 50.035121, 21.985198 ],
      Name: 'Zdrowa Łapa Centrum Aktywności i Rehabilitacji Małych Zwierząt',
      Address: 'Dębowa 12, 35-113 Rzeszów',
      Rodents: true,
      ExoticAnimals: true,
      WebsiteURL: 'http://www.zdrowalapa.pl/',
      Phone: '726 688 883',
      Accepted: true,
      AcceptedDate: new Date('01/01/2016'),
      SuggestedBy: randomizr(users),
      AcceptedBy: users.find(u => u.Role === 'admin')
    })
  ];

  return Vet.insertMany(exampleVets);
};
