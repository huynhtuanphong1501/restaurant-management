
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { TokenService } from 'src/module-system/token/token.service';
import { TokenExpiredError } from "jsonwebtoken";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private prisma: PrismaService, private token: TokenService, private reflector: Reflector) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
      try {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
        ]);
        if (isPublic) {
        // 💡 See this condition
            return true;
          }
          const req = context.switchToHttp().getRequest();
          const { accessToken } = req.cookies;
          if (!accessToken) {
              throw new UnauthorizedException('accessToken not found');
          }
          const decode = this.token.verifyAccessToken(accessToken);
            const userExits = await this.prisma.users.findUnique({
                where: {
                id: decode.id,
                },
            });
            if (!userExits) {
                throw new UnauthorizedException('user not found');
          }
          req.user = userExits;
          return true;
      } catch (error: any) {
          switch (error.constructor) {
        case TokenExpiredError:
          throw new ForbiddenException(error.message);

        default:
          throw new UnauthorizedException('Unauthorized Exception');
      }
      }
  }
}
