import {
  ExceptionFilter,
  Catch,
  HttpException,
  ExecutionContext,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, context: ExecutionContext) {
    // Handle the exception here
  }
}
