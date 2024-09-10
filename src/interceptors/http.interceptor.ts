import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

export class HttpInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((response: any) => {
        return { success: true, msg: response.msg || response.message || 'SUCCESS', data: response.data || response };
      })
    )
  }
}