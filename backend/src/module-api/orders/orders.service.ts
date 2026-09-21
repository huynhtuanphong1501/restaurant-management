import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { OrderGateway } from './orders.gateway';
import { CreateOrderDto } from './dto/createOrder.dto';
import { UpdateOrderDto } from './dto/updateOrder.dto';


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

        let session = await tx.table_sessions.findFirst({
          where: {
            table_id: tableId,
            status: 'ACTIVE',
          },
        });

        if (!session) {
            session = await tx.table_sessions.create({
            data: {
              table_id: tableId,
              status: 'ACTIVE',
            },
          });
        }

        const newOrder = await tx.orders.create({
          data: {
            restaurant_id: restaurantId,
            table_id: tableId,
            session_id: session.id,
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
    this.orderSocket.emitNewOrder(
      order.restaurant_id.toString(),
      order,
    );
    return {
      id: order.id.toString(),
      restaurant_id: order.restaurant_id.toString(),
      table_id: order.table_id.toString(),
      session_id: order.session_id.toString(),
      order_code: order.order_code,
      note: order.note,
      status: order.status,
    };
  }

  async updateOrder(dto: UpdateOrderDto, orderId: string, restaurantId:string) {
    const checkOrder = await this.prisma.orders.findFirst({
      where: {
        id: BigInt(orderId)
      }
    });

    if (!checkOrder) {
      throw new BadRequestException("Order not found");
    }

    const res = await this.prisma.$transaction(
      async (tx) => {
        const order = await tx.orders.update({
          where: {
            id: BigInt(orderId),
          },
          data: {
            status: dto.status,
          }
        });

        await tx.order_items.updateMany({
          where: {
            order_id: BigInt(orderId),
          },
          data: {
            status: dto.status,
          }
        })

        return order;
      })
      
    this.orderSocket.emitUpdateOrder(res.restaurant_id.toString(), res);

    return {
      id: res.id.toString(),
      restaurant_id: res.restaurant_id.toString(),
      table_id: res.table_id.toString(),
      session_id: res.session_id.toString(),
      order_code: res.order_code,
      note: res.note,
      status: res.status
    }
  }

  async getOrderForCustomers(token: string) {
    const checkToken = await this.prisma.table_qr_codes.findFirst({
      where: {
        token: token
      }
    });
    if (!checkToken) {
      throw new BadRequestException("token not found");
    }

    if (checkToken.expires_at && checkToken.expires_at < new Date()) {
      throw new BadRequestException('QR code expired');
    }

    const tableId = checkToken.table_id.toString();

    const checkSess = await this.prisma.table_sessions.findFirst({
      where: {
        table_id: BigInt(tableId),
        status: "ACTIVE"
      }
    })

    if (!checkSess) {
      return {
        session_id: null,
        orders: []
      }
    }

    const res = await this.prisma.orders.findMany({
      where: {
        session_id: checkSess.id
      },
      include: {
        order_items: true
      },
      orderBy: {
        created_at: "asc"
      }
    })

    const result = {
      session_id: checkSess.id.toString(),
      table_id: tableId.toString(),
      orders: res.map((order) => ({
        id: order.id.toString(),
        restaurant_id: order.restaurant_id.toString(),
        table_id: order.table_id.toString(),
        session_id: order.session_id.toString(),
        order_code: order.order_code,
        note: order.note,
        status: order.status,

        order_items: order.order_items.map((item) => ({
          ...item,
          id: item.id.toString(),
          order_id: item.order_id.toString(),
          food_id: item.food_id.toString(),
        })),
      })),
    };

    return result;
  }

  async getAllOrder(restuarntId: string) {
    const checkRes = await this.prisma.restaurants.findFirst({
      where: {
        id: BigInt(restuarntId),
      }
    })

    if (!checkRes) {
      throw new BadRequestException("restaurant not found")
    }

    const res = await this.prisma.orders.findMany({
      where: {
        restaurant_id: checkRes.id
      },
      include: {
        order_items: true
      }
    })

    const result = {
      orders: res.map((order) => ({
        id: order.id.toString(),
        restaurant_id: order.restaurant_id.toString(),
        table_id: order.table_id.toString(),
        session_id: order.session_id.toString(),
        order_code: order.order_code,
        note: order.note,
        status: order.status,

        order_items: order.order_items.map((item) => ({
          ...item,
          id: item.id.toString(),
          order_id: item.order_id.toString(),
          food_id: item.food_id.toString(),
        })),
      }))
    };
    return result;
  }
}
