
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../constants/enum.constant';
import { ROLES_KEY } from '../decorators/role.decorator';
import { PrismaService } from 'src/module-system/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
      const { user } = context.switchToHttp().getRequest();
      if (!user) {
          throw new ForbiddenException('user not found');
      }

      console.log(user);

      const restaurantId = context.switchToHttp().getRequest().params.restaurantId;
      if (!restaurantId) {
          throw new ForbiddenException('restaurant not found');
      }
      const member = await this.prisma.restaurant_members.findFirst({
          where: {
              user_id: BigInt(user.id),
              restaurant_id: BigInt(restaurantId),
              status: 'ACTIVE'
          },
          select: {
              role:true
          }
      });
      console.log(member);
      if (!member) {
        throw new ForbiddenException('You are not a member of this restaurant',
      );
    }
      return requiredRoles.includes(member.role as Role);
  }
}
