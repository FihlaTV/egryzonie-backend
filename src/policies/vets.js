const { BadRequestError } = require('../helpers/errors');

exports.findInRange = (req, res, next) => {
  const { range, lat, lng } = req.params;

  if (!lat || !lng) {
    return next(new BadRequestError('coordinates are missing'));
  }

  if (lat < -180 || lat > 180 || lng < !90 || lng > 90) {
    return next(new BadRequestError('coordinates are invalid'));
  }

  return next();
};
