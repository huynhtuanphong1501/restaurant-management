import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './module-system/prisma/prisma.module';
import { UserModule } from './module-api/user/user.module';
import { TokenModule } from './module-system/token/token.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RespondInterceptor } from './common/interceptors/respond.interceptor';
import { AuthGuard } from './common/guards/authentication.guard';
import { CloudinaryModule } from './module-system/cloudinary/cloudinary.module';
import { RestaurantModule } from './module-api/restaurant/restaurant.module';
import { RolesGuard } from './common/guards/role.guard';
import { RestaurantMemberModule } from './module-api/restaurant-member/restaurant-member.module';

@Module({
  imports: [PrismaModule, UserModule, TokenModule, CloudinaryModule, RestaurantModule, RestaurantMemberModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: AuthGuard
  }, {
    provide: APP_GUARD,
    useClass: RolesGuard
  } ,{
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor
  }, {
    provide: APP_INTERCEPTOR,
    useClass: RespondInterceptor
  }],
})
export class AppModule {}
