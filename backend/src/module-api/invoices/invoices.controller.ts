import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/enum.constant';
import { CreateInvoiceDto } from './dto/createInvoice.dto';


@Controller('restaurant')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post(":restaurantId/createInvoice")
  @Roles(Role.ADMIN, Role.CASHIER, Role.MANAGER, Role.OWNER)
  async createInvoce(
    @Param("restaurantId") restaurantId: string,
    @Query("token") token: string,
    @Body() dto: CreateInvoiceDto
  ) {
    const result = await this.invoicesService.createInvoce(restaurantId, token, dto);
    return {
      result: result,
      message: "create invoice"
    }
  }
}
