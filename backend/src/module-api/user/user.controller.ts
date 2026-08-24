import { Controller, Post, Body, Res, Req, Get, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from 'src/common/decorators/public.decorator';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import type { CookieOptions, Request, Response } from 'express';
import { NODE_ENV } from 'src/common/constants/app.constant';
import { User } from 'src/common/decorators/user.decorator';
import { UpdateInfo } from './dto/update.dto';
import { UpdatePassword } from './dto/updatePassword.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

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

  @Post('update-info')
  async updateInfo(@User() user, @Body() dto: UpdateInfo) {
    const result = await this.userService.updateInfo(user.id, dto);
    return {
      result: result,
      message: 'update user info success'
    }
  }

  @Post('update-password')
  async updatePassword(@User() user, @Body() dto: UpdatePassword) {
    const result = await this.userService.updatePassword(user.id, dto);
    return {
      result: result,
      message: 'update new password success'
    }
  }

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @User() user) {
    const result = await this.userService.uploadAvatar(user.id, file);
    return {
      result: result,
      message: "upload avatar success"
    }
  }
}
