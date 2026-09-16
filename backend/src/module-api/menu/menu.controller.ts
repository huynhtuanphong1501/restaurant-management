import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MenuService } from './menu.service';
import { Public } from 'src/common/decorators/public.decorator';


@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Public()
  @Get(':token')
  async getMenu(@Param('token') token:string) {
    const result = await this.menuService.getMenu(token);
    return {
      result: result,
      message: "get menu"
    }
  }

}
