import { ExecutionContext, createParamDecorator } from '@nestjs/common';

// Define an interface to match the structure of our JWT payload
export interface IUser {
  id: string;
  email: string;
  [key: string]: unknown; // For any additional properties
}

/**
 * Custom decorator to extract user information from JWT or session
 * @example
 * // Extract the entire user object
 * @GetUser() user: IUser
 *
 * // Extract a specific property from the user object
 * @GetUser('id') userId: string
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, 
    @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
    const request: any = ctx.switchToHttp().getRequest();

    if (!request.user) {
      return null;
    }

    if (data) {
      return request.user[data];
    }

    return request.user;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, 
    @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
  },
);
