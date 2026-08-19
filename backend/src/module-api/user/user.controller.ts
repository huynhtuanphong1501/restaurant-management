import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from 'src/common/decorators/public.decorator';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import type { CookieOptions, Request, Response } from 'express';
import { NODE_ENV } from 'src/common/constants/app.constant';
import { User } from 'src/common/decorators/user.decorator';

const COOKIE_OPTIONS : CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDTO) {
    const res = await this.userService.register(dto);
    return {
      result: res,
      message: 'register success'
    }
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDTO, @Res({ passthrough: true }) res: Response) {
    const result = await this.userService.login(dto);
    res.cookie('accessToken', result.accessToken, COOKIE_OPTIONS);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    return {
      result: result,
      message: 'login success'
    }
  }

  @Public()
  @Post('refresh')
  async refresh_token(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.userService.refresh_token(req);
    res.cookie('accessToken', result.accessToken, COOKIE_OPTIONS);
    return {
      result: result,
      message: 'refresh token success'
    }  
  }

  @Get('info')
  async info(@User() user) { 
    const result = await this.userService.info(user.id);
    return {
      result: result,
      message: 'get user info success'
    }
  }
}
