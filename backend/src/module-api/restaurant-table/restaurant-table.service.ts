import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module-system/prisma/prisma.service';
import { CreateTableDto } from './dto/createTabke.dto';
import { TableStatus } from 'src/common/constants/enum.constant';
import { paginate } from 'src/common/helpers/pagination.helper';
import type { Request } from 'express';
import { UpdateTableDto } from './dto/updateTable.dto';


@Injectable()
export class RestaurantTableService {
    constructor(private prisma: PrismaService) { }
    async createTable(restaurantId: string, dto: CreateTableDto) {
        const checkRes = await this.prisma.restaurants.findFirst({
            where: {
                id: BigInt(restaurantId)
            }
        })

        if (!checkRes) {
            throw new BadRequestException("restaurant id not found");
        }

        const checkName = await this.prisma.restaurant_tables.findFirst({
            where: {
                name: dto.name,
                restaurant_id: BigInt(restaurantId)
            }
        })

        if (checkName) {
            throw new BadRequestException("name already exists");
        }

        const result = await this.prisma.restaurant_tables.create({
            data: {
                restaurant_id: BigInt(restaurantId),
                name: dto.name,
                capacity: dto.capacity,
                status: dto.status ?? TableStatus.AVAILABLE
            }
        })

        return {
            ...result,
            id: result.id.toString(),
            restaurant_id: result.restaurant_id.toString()
        }
    }

    async getAllTable(restaurantId: string, req: Request) {
        const checkRes = await this.prisma.restaurants.findFirst({
            where: {
                id: BigInt(restaurantId)
            }
        })

        if (!checkRes) {
            throw new BadRequestException("restaurant id not found");
        }

        const { page, limit, index, where } = paginate(req, []);

        const { name, capacity, status } = req.query;

        const res = await this.prisma.restaurant_tables.findMany({
            where: {
                ...(name && { name: String(name) }),
                ...(capacity && { capacity: Number(capacity) }),
                ...(status && { status: status as TableStatus })
            },
            take: limit,
            skip: index
        })

        const total = await this.prisma.restaurant_tables.count({
            where: {
                ...(name && { name: String(name) }),
                ...(capacity && { capacity: Number(capacity) }),
                ...(status && { status: status as TableStatus })
            },
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data: res.map((table) => ({
                ...table,
                id: table.id.toString(),
                restaurant_id: table.restaurant_id.toString()
            })),
            total: total,
            totalPages: totalPages,
            currentPage: page,
            limit:limit
        }
    }

    async getTable(restaurantId: string, tableId: string) {
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

        return {
            ...checkTable,
            id: checkTable.id.toString(),
            restaurant_id: checkTable.restaurant_id.toString()
        }
    }

    async updateTable(restaurantId: string, tableId: string, dto: UpdateTableDto) {
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

        const checkName = await this.prisma.restaurant_tables.findFirst({
            where: {
                name: dto.name,
                restaurant_id: BigInt(restaurantId)
            }
        })

        if (checkName) {
            throw new BadRequestException("name already exists");
        }

        const res = await this.prisma.restaurant_tables.update({
            where: {
                id: BigInt(tableId),
                },
                data: {
                ...(dto.name !== undefined && {
                    name: dto.name,
                }),
                ...(dto.capacity !== undefined && {
                    capacity: dto.capacity,
                }),
                ...(dto.status !== undefined && {
                    status: dto.status,
                }),
            },
        })

        return {
            ...res,
            id: checkTable.id.toString(),
            restaurant_id: checkTable.restaurant_id.toString()
        }
    }

    async deleteTable(restaurantId: string, tableId: string) {
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

        const res = await this.prisma.restaurant_tables.delete({
            where: {
                restaurant_id: BigInt(restaurantId),
                id: BigInt(tableId)
            }
        });

        return {
           ...res,
            id: checkTable.id.toString(),
            restaurant_id: checkTable.restaurant_id.toString()
        }
    }

}

