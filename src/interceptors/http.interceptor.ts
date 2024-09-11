import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Response } from "express";
import { map, Observable } from "rxjs";

export class HttpInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const ctxResponse = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((response: any) => {
        if(response.totalCount !== undefined){
          ctxResponse.setHeader('X-Total-Count', response.totalCount);
        }

        return { success: true, msg: response.msg || response.message || 'SUCCESS', data: response.data || response };
      })
    )
  }
}