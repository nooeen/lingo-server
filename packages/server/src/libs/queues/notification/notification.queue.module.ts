import { NotificationsModule } from '@libs/notifications';
import { ConfigsService } from '@configs';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationProcessor } from './notification.processor';
import { NotificationQueueService } from './notification.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'notification',
      inject: [ConfigsService],
      useFactory: async (configsService: ConfigsService) => ({
        redis: {
          host: configsService.get('REDIS_HOST'),
          port: Number(configsService.get('REDIS_PORT')),
        },
      }),
    }),
    NotificationsModule,
  ],
  controllers: [],
  providers: [NotificationQueueService, NotificationProcessor],
  exports: [],
})
export class NotificationQueueModule {}
