import { BooksModule } from '@libs/books';
import { QuestionHoldersModule } from '@libs/questionHolders';
import { SentencesModule } from '@libs/sentences';
import { WordsModule } from '@libs/words';
import { Module } from '@nestjs/common';
import { QuestionsController } from './controllers/questions.controller';
import { SentencesController } from './controllers/sentences.controller';
import { WordsController } from './controllers/words.controller';
import { ProgressController } from './controllers/progress.controller';
import { BackupsModule } from '@libs/backups';
import { ProgressesModule } from '@libs/progresses';
import { UsersModule } from '@libs/users';
import { UserManagementController } from './controllers/users.controller';
import { WorksModule } from '@libs/works';
import { WorkManagementController } from './controllers/work.controller';
import { AddressController } from './controllers/address.controller';
import { FollowingsModule } from '@libs/followings';
import { AddressModule } from '@libs/address';

@Module({
  imports: [
    BooksModule,
    WordsModule,
    SentencesModule,
    QuestionHoldersModule,
    BackupsModule,
    ProgressesModule,
    UsersModule,
    WorksModule,
    FollowingsModule,
    AddressModule,
  ],
  controllers: [
    QuestionsController,
    WordsController,
    SentencesController,
    ProgressController,
    UserManagementController,
    WorkManagementController,
    AddressController,
  ],
  exports: [],
})
export class ManagementsModule {}
