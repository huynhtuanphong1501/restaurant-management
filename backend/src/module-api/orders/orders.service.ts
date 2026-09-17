import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { OrderGateway } from './orders.gateway';
import { CreateOrderDto } from './dto/createOrder.dto';


@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private orderSocket: OrderGateway) { }
  
  async createOrder(dto: CreateOrderDto) {
    const qr = await this.prisma.table_qr_codes.findFirst({
      where: {
        token: dto.token,
        is_active: true,
      },
      include: {
        restaurant_tables: true,
      },
    });

    if (!qr) {
      throw new BadRequestException('QR code not found or inactive');
    }

    if ( qr.expires_at && qr.expires_at < new Date()) {
      throw new BadRequestException('QR code expired');
    }
    const table = qr.restaurant_tables;
    const restaurantId = table.restaurant_id;
    const tableId = table.id;

    const foodIds = dto.items.map(
      (item) => BigInt(item.food_id),
    );
    const foods = await this.prisma.foods.findMany({
      where: {
        id: {
          in: foodIds,
        },
        restaurant_id: restaurantId,
        status: 'AVAILABLE',
        deleted_at: null,
      },
    });

    if (foods.length !== dto.items.length) {
      throw new BadRequestException('Some foods are invalid or unavailable');
    }

    const order = await this.prisma.$transaction(
      async (tx) => {

        const newOrder = await tx.orders.create({
          data: {
            restaurant_id: restaurantId,
            table_id: tableId,
            order_code: `ORD-${Date.now()}`,
            note: dto.note,
            status: 'PENDING',
          },
        });
        await tx.order_items.createMany({
          data: dto.items.map((item) => {
            const food = foods.find(
              (f) =>
                f.id === BigInt(item.food_id),
            );

            return {
              order_id: newOrder.id,
              food_id: food!.id,
              food_name: food!.name,
              price: food!.price,
              quantity: item.quantity,
              note: item.note,
              status: 'PENDING',
            };
          }),
        });

        return newOrder;
      },
    );
    return {
      id: order.id.toString(),
      restaurant_id: order.restaurant_id.toString(),
      table_id: order.table_id.toString(),
      order_code: order.order_code,
      note: order.note,
      status: order.status,
    };
  }

}
