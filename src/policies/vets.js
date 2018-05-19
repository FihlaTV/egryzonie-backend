const { BadRequestError } = require('../helpers/errors');

/**
 * Find by range and coordinates
 */
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


/**
 * Search name or address
 */
exports.findByNameOrAddress = (req, res, next) => {
  const { search } = req.body;

  if (!search) {
    return next(new BadRequestError('search text is missing'));
  }

  if (!/^([\u0061-\u007a \u0020 \u0030-\u003A \u003F \u0041-\u005A \u0061-\u007A \u00C0-\u00FF \u0100-\u017F .\-_ÄäÖöÜüẞß]|\w])+$/.test(search)) {
    return next(new BadRequestError('search contains invalid characters'));
  }

  return next();
};
