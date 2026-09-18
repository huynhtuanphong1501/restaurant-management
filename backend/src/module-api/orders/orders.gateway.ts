import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { TokenService } from 'src/module-system/token/token.service';




@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrderGateway {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService, private jwtService: TokenService){}


  async handleConnection(client: Socket) {
  try {
    const token = client.handshake.query.token as string;

    if (!token) {
      console.log('No token');
      client.disconnect();
      return;
    }

    const payload = this.jwtService.verifyAccessToken(token);

    const userId = BigInt(payload.id);

    client.data.userId = userId;

    console.log('Socket connected:', client.id);
    console.log('User ID:', userId.toString());

    const members = await this.prisma.restaurant_members.findMany({
        where: {
          user_id: userId,
          status: 'ACTIVE',
        },
      });

    for (const member of members) {
      const room = `restaurant:${member.restaurant_id.toString()}`;

      await client.join(room);

      console.log(
        `User ${userId} joined ${room}`,
      );
    }

  } catch (error) {
    console.error('Socket authentication failed:', error);  
    client.disconnect();
  }
}

  handleDisconnect(client: Socket) {

    console.log(
      `Socket disconnected: ${client.id}`,
    );
  }


  @SubscribeMessage('join_restaurant')
  async handleJoinRestaurant(
    @ConnectedSocket() client: Socket,

    @MessageBody()
    data: {
      restaurantId: string;
    },
  ) {

    const userId = client.data.userId;

    if (!userId) {
      throw new WsException(
        'Unauthorized',
      );
    }


    const restaurantId = BigInt(data.restaurantId);

    const member = await this.prisma.restaurant_members.findFirst({
        where: {
          user_id: userId,
          restaurant_id: restaurantId,
          status: 'ACTIVE',
        },
      });


    if (!member) {
      throw new WsException(
        'You are not a member of this restaurant',
      );
    }


    const room =
      `restaurant:${restaurantId.toString()}`;


    await client.join(room);


    client.emit('joined_restaurant',
      {
        room,
        role: member.role,
        message: 'Joined successfully',
      }
    );
  }

  emitNewOrder(
    restaurantId: string,
    order: any,
  ) {

    const room = `restaurant:${restaurantId}`;
    
    const data = {
      ...order,
      id: order.id.toString(),
      restaurant_id: order.restaurant_id.toString(),
      table_id: order.table_id.toString()
    };
    this.server
      .to(room)
      .emit('new_order',data);


    console.log(
      `New order emitted to ${room}`,
    );
  }

  emitUpdateOrder(
    restaurantId: string,
    order: any
  ) {
    const room = `restaurant:${restaurantId}`;
    
    const data = {
      ...order,
      id: order.id.toString(),
      restaurant_id: order.restaurant_id.toString(),
      table_id: order.table_id.toString()
    };
    this.server
      .to(room)
      .emit('update_order', data);
  }
}