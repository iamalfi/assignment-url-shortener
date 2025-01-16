import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';

interface ErrorWithResponse extends Error {
  response?: {
    name?: string;
    message?: string;
  };
}

function isErrorWithResponse(exception: any): exception is ErrorWithResponse {
  return typeof exception === 'object' && 'response' in exception;
}

@Catch()
export class UnknownExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      error:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Internal Server Error'
          : isErrorWithResponse(exception)
            ? exception.response?.name || exception.name
            : 'Unknown Error',
      message:
        exception instanceof Error
          ? isErrorWithResponse(exception)
            ? exception.response?.message || exception.message
            : exception.message
          : 'An unknown error occurred',
      path: request ? request.url : undefined,
    };
    response.status(status).send(errorResponse);
  }
}
