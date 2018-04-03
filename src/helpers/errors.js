class ValidationError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'Validation Error';
  }
}

class NotFoundError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'NotFound Error';
  }
}

exports.ValidationError = ValidationError;
exports.NotFoundError = NotFoundError;
