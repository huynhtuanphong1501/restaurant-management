import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { PORT } from './common/constants/app.constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe(
    {
      transform: true,
      whitelist: true
    }
  ));
  app.use(cookieParser());
  await app.listen(PORT as string, () => { 
    console.log(`Server is running on ${PORT}`)
  });
}
bootstrap();
