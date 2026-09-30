export enum HttpStatus {
  /**
   * Operation successful
   */
  SUCCESS = 200,
  /**
   * Object created successfully
   */
  CREATED = 201,
  /**
   * Request has been accepted
   */
  ACCEPTED = 202,
  /**
   * Operation succeeded, but no data was returned
   */
  NO_CONTENT = 204,
  /**
   * Resource has been removed
   */
  MOVED_PERM = 301,
  /**
   * Redirect
   */
  SEE_OTHER = 303,
  /**
   * Resource was not modified
   */
  NOT_MODIFIED = 304,
  /**
   * Parameter list error (missing, format mismatch)
   */
  PARAM_ERROR = 400,
  /**
   * Unauthorized
   */
  UNAUTHORIZED = 401,
  /**
   * Access restricted, authorization expired
   */
  FORBIDDEN = 403,
  /**
   * Resource, Service Not Found
   */
  NOT_FOUND = 404,
  /**
   * Disallowed HTTP method
   */
  BAD_METHOD = 405,
  /**
   * Resource conflict, or resource is locked
   */
  CONFLICT = 409,
  /**
   * Unsupported data, media type
   */
  UNSUPPORTED_TYPE = 415,
  /**
   * Internal System Error
   */
  SERVER_ERROR = 500,
  /**
   * API not implemented
   */
  NOT_IMPLEMENTED = 501,
  /**
   * Service unavailable, overloaded or under maintenance
   */
  BAD_GATEWAY = 502,
  /**
   * Gateway Timeout
   */
  GATEWAY_TIMEOUT = 504,
  /**
   * Unknown Error
   */
  UNKNOWN_ERROR = 520,
  /**
   * Unknown service error
   */
  SERVICE_ERROR = 521,
  /**
   * Unknown database error
   */
  DATABASE_ERROR = 522,
  /**
   * System warning message
   */
  WARN = 601
}
