import { BadRequestException, Injectable } from '@nestjs/common';
import { TokenService } from 'src/module-system/token/token.service';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { AddMemberDto } from './dto/addMember.dto';
import { paginate } from 'src/common/helpers/pagination.helper';
import { Request } from 'express';
import { UpdateMemberDto } from './dto/updateMember.dto';
import { DeleteMemberDTO } from './dto/deleteMember.dto';


@Injectable()
export class RestaurantMemberService {
  constructor(private prisma: PrismaService, private token: TokenService) { }
  async addMemberToRestaurant(restaurantId: string, body: AddMemberDto) {
    const res = await this.prisma.restaurants.findUnique({
      where: {
        id: BigInt(restaurantId)
      }
    });
    if(!res) {
      throw new Error('Restaurant not found');
    }
    const user = await this.prisma.users.findUnique({
      where: {
        id: BigInt(body.user_id)
      }
    });
    if(!user) {
      throw new Error('User not found');
    };

    const member = await this.prisma.restaurant_members.findFirst({
      where: {
        restaurant_id: BigInt(restaurantId),
        user_id: BigInt(body.user_id)
      }
    });
    if(member) {
      throw new Error('User is already a member of this restaurant');
    };

    const result = await this.prisma.restaurant_members.create({
      data: {
        restaurant_id: BigInt(restaurantId),
        user_id: BigInt(body.user_id),
        role: body.role
      }
    });
    return {
      ...result,
      id: result.id.toString(),
      restaurant_id: result.restaurant_id.toString(),
      user_id: result.user_id.toString()
    };
  }

  async getMembersOfRestaurant(restaurantId: string, request: Request) {
    const res = await this.prisma.restaurants.findUnique({
      where: {
        id: BigInt(restaurantId)
      }
    });
    if(!res) {
      throw new Error('Restaurant not found');
    }
    const { page, limit, index, where } = paginate(request, []);

    const { role, status } = request.query as { role?: string, status?: string };
    
    const members = await this.prisma.restaurant_members.findMany({
      where: {
        restaurant_id: BigInt(restaurantId),
        ...where,
        ...(role ? { role: role as any } : {}),
        ...(status ? { status: status as any } : {}),
      },
      skip: index,
      take: limit,
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    const total = await this.prisma.restaurant_members.count({
      where: {
        restaurant_id: BigInt(restaurantId),
        ...where,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: members.map((member) => ({
        id: member.id.toString(),
        restaurant_id: member.restaurant_id.toString(),
        user: {
          id: member.users.id.toString(),
          full_name: member.users.full_name,
          email: member.users.email,
          phone: member.users.phone,
          status: member.users.status,
        },
        role: member.role,
        status: member.status,
      })),
      total,
      totalPages,
      currentPage: page,
      limit,
    };
  }

  async getMemberById(restaurantId: string, memberId: string) {
    const res = await this.prisma.restaurants.findUnique({
      where: {
        id: BigInt(restaurantId)
      }
    });
    if(!res) {
      throw new Error('Restaurant not found');
    }

    const member = await this.prisma.restaurant_members.findUnique({
      where: {
        id: BigInt(memberId)
      },
      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    if(!member) {
      throw new Error('Member not found');
    }

    return {
      id: member.id.toString(),
      restaurant_id: member.restaurant_id.toString(),
      user: {
        id: member.users.id.toString(),
        full_name: member.users.full_name,
        email: member.users.email,
        phone: member.users.phone,
        status: member.users.status,
      },
      role: member.role,
      status: member.status,
    };
  }

  async updateMember(restaurantId: string, body: UpdateMemberDto) {
    const res = await this.prisma.restaurants.findUnique({
      where: {
        id: BigInt(restaurantId)
      }
    });
    if(!res) {
      throw new BadRequestException('Restaurant not found');
    }

    const { user_id, role, status } = body;

    const member = await this.prisma.restaurant_members.findFirst({
      where: {
        restaurant_id: BigInt(restaurantId),
        user_id: BigInt(user_id)
      }
    });
    if(!member) {
      throw new BadRequestException('Member not found');
    }

    const updatedMember = await this.prisma.restaurant_members.update({
      where: {
        id: member.id
      },
      data: {
        role: role,
        status: status
      }
    });

    return {
      ...updatedMember,
      id: updatedMember.id.toString(),
      restaurant_id: updatedMember.restaurant_id.toString(),
      user_id: updatedMember.user_id.toString()
    };
  };

  async deleteMember(restaurantId: string, body: DeleteMemberDTO) {
    const res = await this.prisma.restaurants.findUnique({
      where: {
        id: BigInt(restaurantId)
      }
    });
    if(!res) {
      throw new BadRequestException('Restaurant not found');
    }

    const { user_id } = body;

    const member = await this.prisma.restaurant_members.findFirst({
      where: {
        restaurant_id: BigInt(restaurantId),
        user_id: BigInt(user_id)
      }
    });
    if(!member) {
      throw new BadRequestException('Member not found');
    }

    const deletedMember = await this.prisma.restaurant_members.delete({
      where: {
        id: member.id
      }
    });

    return {
      ...deletedMember,
      id: deletedMember.id.toString(),
      restaurant_id: deletedMember.restaurant_id.toString(),
      user_id: deletedMember.user_id.toString()
    };
  }
}
