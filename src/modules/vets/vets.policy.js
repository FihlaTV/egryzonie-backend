const path = require('path');
const { BadRequestError } = require(path.resolve('src/core/helpers/errors.helper'));

/**
 * GET /find_one/:id
 * Find one by ID
 */
exports.findById = (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.length) {
    return next(new BadRequestError('id is missing'));
  }

  if (!/^[a-f\d]{24}$/i.test(id)) {
    return next(new BadRequestError('id has invalid format'));
  }

  return next();
};



/**
 * GET /:slug/view
 * Find single Vet place
 */
exports.findBySlug = async(req, res, next) => {
  const { slug } = req.params;

  if (!/^[a-z0-9-]{1,}$/.test(slug)) {
    return next(new BadRequestError('slug is invalid'));
  }

  return next();
};



/**
 * Find by range and coordinates
 * POST /find_nearby/:range/:lat/:lng
 */
exports.findInRange = (req, res, next) => {
  const { range, lat, lng } = req.body;

  if (!range) {
    return next(new BadRequestError('range is missing'));
  }

  if (!Number.isFinite(range) || range <= 0) {
    return next(new BadRequestError('range is invalid'));
  }

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
