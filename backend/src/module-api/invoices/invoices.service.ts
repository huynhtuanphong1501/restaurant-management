import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/createInvoice.dto';


@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService){}
  async createInvoce(
  restaurantId: string,
  token: string,
  dto: CreateInvoiceDto,
) {
  const qr = await this.prisma.table_qr_codes.findFirst({
    where: {
      token,
      is_active: true,
      restaurant_tables: {
        restaurant_id: BigInt(restaurantId),
      },
    },
    include: {
      restaurant_tables: true,
    },
  });

  if (!qr) {
    throw new BadRequestException(
      'QR code not found or does not belong to this restaurant',
    );
  }

  if (qr.expires_at && qr.expires_at < new Date()) {
    throw new BadRequestException('QR code expired');
  }

  const tableId = qr.restaurant_tables.id;

  const session = await this.prisma.table_sessions.findFirst({
    where: {
      table_id: tableId,
      status: 'ACTIVE',
    },
  });

  if (!session) {
    throw new BadRequestException('No active session');
  }

  const orders = await this.prisma.orders.findMany({
    where: {
      restaurant_id: BigInt(restaurantId),
      table_id: tableId,
      session_id: session.id,
      invoice_id: null,
      status: {
        not: 'CANCELLED',
      },
    },
    include: {
      order_items: true,
    },
  });

  if (orders.length === 0) {
    throw new BadRequestException('No orders to invoice');
  }

  let subtotal = 0;

  for (const order of orders) {
    for (const item of order.order_items) {
      if (item.status === 'CANCELLED') {
        continue;
      }

      subtotal += Number(item.price) * item.quantity;
    }
  }

  const discount = dto.discount ?? 0;
  const tax = dto.tax ?? 0;

  const total = subtotal - discount + tax;

  if (total < 0) {
    throw new BadRequestException('Invalid invoice total');
  }

  const invoice = await this.prisma.$transaction(async (tx) => {
    const newInvoice = await tx.invoices.create({
      data: {
        restaurant_id: BigInt(restaurantId),
        table_id: tableId,

        invoice_code: `INV-${Date.now()}`,

        subtotal,
        discount,
        tax,
        total,

        status: 'OPEN',
      },
    });

    await tx.orders.updateMany({
      where: {
        id: {
          in: orders.map((order) => order.id),
        },
      },
      data: {
        invoice_id: newInvoice.id,
      },
    });

    return newInvoice;
  });

  return {
    id: invoice.id.toString(),
    restaurant_id: invoice.restaurant_id.toString(),
    table_id: invoice.table_id.toString(),

    invoice_code: invoice.invoice_code,

    subtotal: invoice.subtotal,
    discount: invoice.discount,
    tax: invoice.tax,
    total: invoice.total,

    status: invoice.status,

    opened_at: invoice.opened_at,
    closed_at: invoice.closed_at,
  };
}
}
