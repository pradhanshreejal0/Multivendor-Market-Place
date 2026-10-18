import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle Zod validation errors if any reach here directly
  if (err instanceof ZodError) {
    const message = 'Validation failed';
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(422).json({
      status: 'fail',
      message,
      errors,
    });
  }

  // Handle Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid ${err.path}: ${err.value}`;
    err.statusCode = 404;
    err.message = message;
  }

  // Handle Mongoose duplicate key
  if (err.code === 11000) {
    const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : '';
    const message = `Duplicate field value: ${value}. Please use another value!`;
    err.statusCode = 409;
    err.message = message;
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message,
    }));
    const message = 'Invalid input data';
    return res.status(422).json({
      status: 'fail',
      message,
      errors,
    });
  }

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Production: don't leak error details
    res.status(err.statusCode).json({
      status: err.status,
      message: err.isOperational ? err.message : 'Something went wrong!',
      ...(err.errors && { errors: err.errors }),
    });
  }
};
