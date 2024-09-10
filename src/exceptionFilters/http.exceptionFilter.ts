import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter{
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const exceptionStatus = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    return response
      .status(exceptionStatus)
      .json({ success: false, msg: this.serializeMessage(exceptionResponse['message']) })
  }

  private serializeMessage(message: string | string[] | null): string {
    if(Array.isArray(message)) return message[0].replace(/\s/g, '_');
    if(typeof message === 'string') return message.replace(/\s/g, '_');
    else return 'ERROR_OCCURED';
  }
}