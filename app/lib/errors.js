'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.test = getErrorMessage;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called",
    );
  }
  return call && (typeof call === 'object' || typeof call === 'function')
    ? call
    : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError(
      'Super expression must either be null or a function, not ' +
        typeof superClass,
    );
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
  if (superClass)
    Object.setPrototypeOf
      ? Object.setPrototypeOf(subClass, superClass)
      : (subClass.__proto__ = superClass);
}

var HttpError = (exports.HttpError = (function(_Error) {
  _inherits(HttpError, _Error);

  function HttpError() {
    _classCallCheck(this, HttpError);

    return _possibleConstructorReturn(
      this,
      (HttpError.__proto__ || Object.getPrototypeOf(HttpError)).call(this),
    );
  }

  return HttpError;
})(Error));

var BadRequestError = (exports.BadRequestError = (function(_HttpError) {
  _inherits(BadRequestError, _HttpError);

  function BadRequestError(message) {
    _classCallCheck(this, BadRequestError);

    var _this2 = _possibleConstructorReturn(
      this,
      (
        BadRequestError.__proto__ || Object.getPrototypeOf(BadRequestError)
      ).call(this),
    );

    _this2.name = _this2.constructor.name;
    _this2.message = message || 'Invalid request';
    _this2.status = 400;
    return _this2;
  }

  return BadRequestError;
})(HttpError));

var UnauthorizedError = (exports.UnauthorizedError = (function(_HttpError2) {
  _inherits(UnauthorizedError, _HttpError2);

  function UnauthorizedError(message) {
    _classCallCheck(this, UnauthorizedError);

    var _this3 = _possibleConstructorReturn(
      this,
      (
        UnauthorizedError.__proto__ || Object.getPrototypeOf(UnauthorizedError)
      ).call(this),
    );

    _this3.name = _this3.constructor.name;
    _this3.message = message || 'Unauthorized';
    _this3.status = 401;
    return _this3;
  }

  return UnauthorizedError;
})(HttpError));

var ForbiddenError = (exports.ForbiddenError = (function(_HttpError3) {
  _inherits(ForbiddenError, _HttpError3);

  function ForbiddenError(message) {
    _classCallCheck(this, ForbiddenError);

    var _this4 = _possibleConstructorReturn(
      this,
      (ForbiddenError.__proto__ || Object.getPrototypeOf(ForbiddenError)).call(
        this,
      ),
    );

    _this4.name = _this4.constructor.name;
    _this4.message = message || 'User is not authorized';
    _this4.status = 403;
    return _this4;
  }

  return ForbiddenError;
})(HttpError));

var NotFoundError = (exports.NotFoundError = (function(_HttpError4) {
  _inherits(NotFoundError, _HttpError4);

  function NotFoundError(message) {
    _classCallCheck(this, NotFoundError);

    var _this5 = _possibleConstructorReturn(
      this,
      (NotFoundError.__proto__ || Object.getPrototypeOf(NotFoundError)).call(
        this,
      ),
    );

    _this5.name = _this5.constructor.name;
    _this5.message = message || 'Not found';
    _this5.status = 404;
    return _this5;
  }

  return NotFoundError;
})(HttpError));

var ValidationError = (exports.ValidationError = (function(_BadRequestError) {
  _inherits(ValidationError, _BadRequestError);

  function ValidationError(paths, message) {
    _classCallCheck(this, ValidationError);

    var _this6 = _possibleConstructorReturn(
      this,
      (
        ValidationError.__proto__ || Object.getPrototypeOf(ValidationError)
      ).call(this, message || 'Validation error'),
    );

    _this6.name = _this6.constructor.name;
    _this6.paths = paths;
    return _this6;
  }

  return ValidationError;
})(BadRequestError));

var SimulatedError = (exports.SimulatedError = (function(_Error2) {
  _inherits(SimulatedError, _Error2);

  function SimulatedError(message) {
    _classCallCheck(this, SimulatedError);

    var _this7 = _possibleConstructorReturn(
      this,
      (SimulatedError.__proto__ || Object.getPrototypeOf(SimulatedError)).call(
        this,
      ),
    );

    Error.captureStackTrace(_this7, _this7.constructor);
    _this7.name = _this7.constructor.name;
    _this7.message = message || 'Simulated error';
    _this7.status = 500;
    return _this7;
  }

  return SimulatedError;
})(Error));

var defaultResponse = {
  message: 'Something went wrong on the server',
  status: 500,
};

function getErrorMessage(err) {
  console.log('HELLO');
  if ((err.code && err.code === 11000) || err.code === 11001) {
    return {
      message: 'Unique field already exists',
      status: 400,
    };
  }

  if (err instanceof HttpError) {
    return {
      message: err.message,
      status: err.status,
      paths: err.paths,
    };
  }

  //This catches when body-parser encounters bad JSON user data in a request
  if (
    err.stack.match(/^SyntaxError:.+in JSON(.|\n)*node_modules\/body-parser/)
  ) {
    return {
      message:
        process.env.NODE_ENV === 'production'
          ? 'The data received by the server is not properly formatted. Try refreshing your browser.'
          : 'Bad JSON in HTTP request. ' + err.message + ':  ' + err.body,
      status: 400,
    };
  }

  return defaultResponse;
}
