import { createParamDecorator, ExecutionContext } from '@nestjs/common'; // Adjust the import path as needed

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
