class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
  static badRequest(message = 'Bad request') { return new ApiError(400, message); }
  static notFound(message = 'Not found') { return new ApiError(404, message); }
  static conflict(message = 'Conflict') { return new ApiError(409, message); }
  static internal(message = 'Internal server error') { return new ApiError(500, message); }
}
module.exports = ApiError;
