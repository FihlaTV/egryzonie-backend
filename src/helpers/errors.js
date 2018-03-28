class ValidationError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'ValidationError';
  }
}

exports.ValidationError = ValidationError;