import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/constants/enum.constant';
import { CreateInvoiceDto } from './dto/createInvoice.dto';
import { Public } from 'src/common/decorators/public.decorator';


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

  @Get(":restaurantId/invoice/:invoiceId")
  @Roles(Role.ADMIN, Role.CASHIER, Role.MANAGER, Role.OWNER)
  async getInvoiceById(
    @Param("restaurantId") restaurantId: string,
    @Param("invoiceId") invoiceId: string,
  ) {
    const result = await this.invoicesService.getInvoiceById(restaurantId, invoiceId);
    return {
      result: result,
      message: "get invoice by id"
    }
  }

  @Public()
  @Get(":restaurantId/invoice")
  async getInvoiceByToken(
    @Param("restaurantId") restaurantId: string,
    @Query("token") token: string,
  ) {
    const result = await this.invoicesService.getInvoiceByToken(restaurantId, token);
    return {
      result: result,
      message: "get invoice from customer"
    }
  }

  @Get(":restaurantId/invoices")
  @Roles(Role.ADMIN, Role.CASHIER, Role.MANAGER, Role.OWNER)
  async getInvoiceOfRes(
    @Param("restaurantId") restaurantId: string,
  ) {
    const result = await this.invoicesService.getInvoiceOfRes(restaurantId);
    return {
      result: result,
      message: "get invoice of restaurant"
    }
  }
}
