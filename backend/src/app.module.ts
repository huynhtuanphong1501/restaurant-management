import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './module-system/prisma/prisma.module';
import { UserModule } from './module-api/user/user.module';
import { TokenModule } from './module-system/token/token.module';

@Module({
  imports: [PrismaModule, UserModule, TokenModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
