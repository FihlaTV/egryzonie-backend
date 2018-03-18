exports.HomePage = (req, res, next) => {
  console.log('Looking for User in request.', req.user);
  return res.json({ message: 'Welcome to eGryzonie API. You probably should not be here.' });
};
