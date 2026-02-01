import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // If we pass @GetUser('userId'), return just the ID.
    // If we pass @GetUser(), return the whole user object.
    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);
