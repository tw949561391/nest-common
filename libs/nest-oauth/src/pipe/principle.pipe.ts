import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Principle } from '..';

export const AuthPrinciple = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Principle => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);