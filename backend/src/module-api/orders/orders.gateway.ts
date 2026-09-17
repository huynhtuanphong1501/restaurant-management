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

    constructor(private prisma: PrismaService, private jwtService: TokenService){}

  @WebSocketServer()
  server: Server;


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

    const members =
      await this.prisma.restaurant_members.findMany({
        where: {
          user_id: userId,
          status: 'ACTIVE',
        },
      });

    for (const member of members) {
      const room =
        `restaurant:${member.restaurant_id.toString()}`;

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


  // =========================
  // SOCKET DISCONNECT
  // =========================

  handleDisconnect(client: Socket) {

    console.log(
      `Socket disconnected: ${client.id}`,
    );
  }


  // =========================
  // TEST JOIN
  // =========================

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


    const restaurantId =
      BigInt(data.restaurantId);


    // Kiểm tra user có thuộc restaurant không
    const member =
      await this.prisma.restaurant_members.findFirst({
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


    client.emit(
      'joined_restaurant',
      {
        room,
        role: member.role,
        message: 'Joined successfully',
      },
    );
  }


  // =========================
  // EMIT NEW ORDER
  // =========================

  emitNewOrder(
    restaurantId: string,
    order: any,
  ) {

    const room =
      `restaurant:${restaurantId}`;


    this.server
      .to(room)
      .emit(
        'new_order',
        order,
      );


    console.log(
      `New order emitted to ${room}`,
    );
  }
}