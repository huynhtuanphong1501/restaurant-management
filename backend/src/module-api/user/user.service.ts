import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { RegisterDTO } from './dto/register.dto';
import bcrypt from 'bcrypt';
import { LoginDTO } from './dto/login.dto';
import { TokenService } from 'src/module-system/token/token.service';
import { hash } from '../../common/helpers/hash.helper'
import type { Request } from 'express';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService, private readonly token: TokenService) { }
  async register(dto: RegisterDTO) {
    const check = await this.prisma.users.findUnique({
      where: {
        email: dto.email,
      }
    })
    if (check) { 
      throw new BadRequestException('User exists');
    }
    const hash_pass = hash(dto.password);
    const res = await this.prisma.users.create({
      data: {
        full_name: dto.full_name,
        email: dto.email,
        password_hash: hash_pass,
        phone: dto.phone
      }
    });
    return {
      ...res,
      id: res.id.toString()
    };
  }

  async login(dto: LoginDTO) { 
    const { email, password } = dto;
    const check = await this.prisma.users.findUnique({
      where: {
        email: email,
      }
    });
    if (!check) { 
      throw new BadRequestException('User not found');
    }
    const compare = bcrypt.compareSync(password, check.password_hash);
    if (!compare) {
      throw new BadRequestException('password error');
    }
    
    await this.prisma.refresh_tokens.updateMany({
      where: {
        user_id: check.id,
        revoked_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
      data: {
        revoked_at: new Date(),
      },
    });

    const accessToken = this.token.signAccessToken(check.id);
    const refreshToken = this.token.signRefreshToken(check.id);

    const hash_refresh_token = hash(refreshToken);
    const getExp = this.token.verifyRefreshToken(refreshToken);
    await this.prisma.refresh_tokens.create({
      data: {
        user_id: check.id,
        token_hash: hash_refresh_token,
        expires_at: new Date(getExp.exp * 1000)
      }
    })

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh_token(req: Request) {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token not found',
      );
    }

    const decode = this.token.verifyRefreshToken(refreshToken);
    const refreshTokens = await this.prisma.refresh_tokens.findMany({
        where: {
          user_id: decode.id,
          revoked_at: null,
          expires_at: {
            gt: new Date(),
          },
        },
    });
    const storedToken = refreshTokens.find((token) => bcrypt.compareSync(refreshToken, token.token_hash));
    if (!storedToken) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }
    const accessToken = this.token.signAccessToken(decode.id);

    return {
      accessToken,
    };
  }

  async info(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: {
        id: BigInt(userId),
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        created_at: true,
        updated_at: true
      }
    });
    if (!user) {
      throw new BadRequestException('user not found');
    }
    return {
      ...user,
      id: user.id.toString()
    };
  }

}
