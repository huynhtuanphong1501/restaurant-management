import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { randomBytes } from 'crypto';
import { paginate } from 'src/common/helpers/pagination.helper';
import { UpdateQrCodeDto } from './dto/updateQr.dto';

@Injectable()
export class QrService {
  constructor(private prisma: PrismaService) { }

  async createQr(restaurantId: string, tableId: string) {
    const checkRes = await this.prisma.restaurants.findFirst({
            where: {
                id: BigInt(restaurantId)
            }
    })

    if (!checkRes) {
        throw new BadRequestException("restaurant id not found");
    }

    const checkTable = await this.prisma.restaurant_tables.findFirst({
        where: {
            restaurant_id: BigInt(restaurantId),
            id: BigInt(tableId)
        }
    });
    if (!checkTable) {
      throw new BadRequestException("table not found");
    }

    const checkQr = await this.prisma.table_qr_codes.findFirst({
      where: {
        table_id: BigInt(tableId),
      }
    });

    if (checkQr) {
      throw new BadRequestException('table already has qr')
    }

    const token = randomBytes(32).toString('hex');
    const res = await this.prisma.table_qr_codes.create({
      data: {
        table_id: BigInt(tableId),
        token: token
      }
    });
    return {
      ...res,
      token: token,
      id: res.id.toString(),
      table_id: res.table_id.toString()
    }
  }

  async getAllQr(restaurantId: string, req: Request) {
    const checkRes = await this.prisma.restaurants.findFirst({
        where: {
            id: BigInt(restaurantId)
        }
    })

    if (!checkRes) {
        throw new BadRequestException("restaurant id not found");
    }

    const { page, limit, index, where } = paginate(req, ["token"]);


    const res = await this.prisma.table_qr_codes.findMany({
        where: where,
        take: limit,
        skip: index
    })

    const total = await this.prisma.table_qr_codes.count({
        where: where
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: res.map((qr) => ({
          ...qr,
          id: qr.id.toString(),
          table_id: qr.table_id.toString()
      })),
      total: total,
      totalPages: totalPages,
      currentPage: page,
      limit:limit
    }
  }

  async getQr(restaurantId: string, tableId: string, qrId: string) {
    const checkRes = await this.prisma.restaurants.findFirst({
        where: {
            id: BigInt(restaurantId)
        }
    })

    if (!checkRes) {
        throw new BadRequestException("restaurant id not found");
    }

    const checkTable = await this.prisma.restaurant_tables.findFirst({
        where: {
            restaurant_id: BigInt(restaurantId),
            id: BigInt(tableId)
        }
    });

    if (!checkTable) {
        throw new BadRequestException("table not found");
    }

    const qr = await this.prisma.table_qr_codes.findFirst({
      where: {
        id: BigInt(qrId),
        table_id: BigInt(tableId),
        restaurant_tables: {
          restaurant_id: BigInt(restaurantId),
        },
      },
      include: {
        restaurant_tables: true,
      },
    });

    if (!qr) {
      throw new BadRequestException('QR code not found');
    }

    return {
      id: qr.id.toString(),
      table_id: qr.table_id.toString(),
      token: qr.token,
      is_active: qr.is_active,
      expires_at: qr.expires_at,

      table: {
        id: qr.restaurant_tables.id.toString(),
        name: qr.restaurant_tables.name,
        capacity: qr.restaurant_tables.capacity,
        status: qr.restaurant_tables.status,
        restaurant_id:
          qr.restaurant_tables.restaurant_id.toString(),
      },
    };
  }

  async updateQr(restaurantId: string, tableId: string, qrId: string, dto: UpdateQrCodeDto) {
    const checkRes = await this.prisma.restaurants.findFirst({
        where: {
            id: BigInt(restaurantId)
        }
    })

    if (!checkRes) {
        throw new BadRequestException("restaurant id not found");
    }

    const checkTable = await this.prisma.restaurant_tables.findFirst({
        where: {
            restaurant_id: BigInt(restaurantId),
            id: BigInt(tableId)
        }
    });

    if (!checkTable) {
        throw new BadRequestException("table not found");
    }

    const checkQr = await this.prisma.table_qr_codes.findFirst({
      where: {
        id: BigInt(qrId),
        table_id: BigInt(tableId),
        restaurant_tables: {
          restaurant_id: BigInt(restaurantId),
        },
      },
    });

    if (!checkQr) {
      throw new BadRequestException('QR code not found');
    }

    const res = await this.prisma.table_qr_codes.update({
      where: {
        id: BigInt(qrId),
      },
      data: {
        ...(dto.is_active !== undefined && {is_active: dto.is_active}),
        ...(dto.expires_at !== undefined && {expires_at: new Date(dto.expires_at)}),
      },
    });

    return {
      ...res,
      id: res.id.toString(),
      table_id: res.table_id.toString(),
    };
  }
}
