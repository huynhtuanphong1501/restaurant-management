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

@Module({
  imports: [PrismaModule, UserModule, TokenModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: AuthGuard
  } ,{
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor
  }, {
    provide: APP_INTERCEPTOR,
    useClass: RespondInterceptor
  }],
})
export class AppModule {}
