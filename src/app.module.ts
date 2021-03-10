import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './libs/books/books.module';
import { UsersModule } from './libs/users/users.module';

@Module({
  imports: [BooksModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
