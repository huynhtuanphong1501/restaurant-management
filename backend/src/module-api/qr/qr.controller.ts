import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Put } from '@nestjs/common';
import { QrService } from './qr.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/enum.constant';
import { UpdateQrCodeDto } from './dto/updateQr.dto';

@Controller('restaurant')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post(':restaurantId/table/:tableId/qr/create')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async createTable(
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string
  ) {
    const result = await this.qrService.createQr(restaurantId, tableId);
    return {
      result: result,
      message: "create qr"
    }
  }

  @Get(':restaurantId/qr')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async getAllQr(@Param('restaurantId') restaurantId: string, @Req() req: Request) {
    const result = await this.qrService.getAllQr(restaurantId, req);
    return {
      result: result,
      message: "get all qr"
    }
  }

  @Get(':restaurantId/table/:tableId/qr/:qrId')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async getQr(
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
    @Param('qrId') qrId: string
  ) {
    const result = await this.qrService.getQr(restaurantId, tableId, qrId);
    return {
      result: result,
      message: "get qr detail"
    }
  }

  @Put(':restaurantId/table/:tableId/qr/:qrId/update')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async updateQr(
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
    @Param('qrId') qrId: string,
    @Body() dto: UpdateQrCodeDto,
  ) {
    const result = await this.qrService.updateQr(restaurantId, tableId, qrId, dto);
    return {
      result: result,
      message: "update qr"
    }
  }
}
