import { Statistic } from '@dto/leaderBoard/statistic.dto';
import { UserRank } from '@dto/leaderBoard/userRank.dto';
import {
  ScoreStatistic,
  ScoreStatisticDocument,
} from '@entities/scoreStatistic.entity';
import { UserDocument } from '@entities/user.entity';
import { ScoreStatisticsHelper } from '@helpers/scoreStatistics.helper';
import { UsersService } from '@libs/users/providers/users.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { Model, Types } from 'mongoose';
import { Location } from '@utils/enums';
import { TOP_XP_LENGTH } from '@utils/constants';

@Injectable()
export class ScoreStatisticsService {
  constructor(
    @InjectModel(ScoreStatistic.name)
    private scoreStatisticModel: Model<ScoreStatisticDocument>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private scoreStatisticsHelper: ScoreStatisticsHelper,
  ) {}

  public async getRankByTime(
    userId: string,
    timeSelect: string,
    location?: string,
    locationId?: number,
  ): Promise<UserRank[]> {
    timeSelect = timeSelect.trim();
    if (!timeSelect) {
      throw new BadRequestException('timeSelect not entered');
    }
    let startTime: string;
    let xpArr: UserRank[] = [];
    switch (timeSelect) {
      case 'week':
        startTime = dayjs().startOf('week').format();
        break;
      case 'month':
        startTime = dayjs().startOf('month').format();
        break;
      case 'all':
        xpArr = await this.usersService.getAllTimeUserXpList(
          location,
          locationId,
        );
        break;
      default:
        break;
    }
    const endTime = dayjs().format();
    if (timeSelect != 'all') {
      const filter = {
        createdAt: {
          $gte: startTime,
          $lte: endTime,
        },
      };
      xpArr = await this.getTotalXp(userId, filter, locationId, location);
    }
    if (
      !(await this.usersService.isUserInLocation(userId, location, locationId))
    ) {
      return xpArr.slice(0, TOP_XP_LENGTH).map((i) => {
        i.orderNumber = i.orderNumber + 1;
        return i;
      });
    }
    return await this.handleLastUser(userId, xpArr);
  }
  private async handleLastUser(
    userId: string,
    xpArr: UserRank[],
  ): Promise<UserRank[]> {
    let topLength = TOP_XP_LENGTH;
    const userResult = await this.usersService.queryMe(userId);
    if (xpArr.length == 0) {
      xpArr.push({
        orderNumber: 1,
        displayName: userResult.displayName,
        avatar: userResult.avatar,
        userId: new Types.ObjectId(userId),
        xp: userResult.xp,
        isCurrentUser: true,
      });
      return xpArr;
    }

    if (xpArr.length < topLength) topLength = xpArr.length;
    let isInTop = false;
    for (let i = 0; i < topLength; i++) {
      const item = xpArr[i];
      if (item.userId.toHexString() == userId) {
        isInTop = true;
        item.isCurrentUser = true;
      }
      item.orderNumber = i + 1;
    }
    if (isInTop == false) {
      let lastUser: UserRank;
      for (let i = 0; i < xpArr.length; i++) {
        const item = xpArr[i];
        if (item.userId.toHexString() == userId) {
          item.orderNumber = i + 1;
          item.isCurrentUser = true;
          lastUser = item;
          break;
        }
      }
      if (!lastUser) {
        lastUser = {
          orderNumber: xpArr.length + 1,
          displayName: userResult.displayName,
          avatar: userResult.avatar,
          userId: new Types.ObjectId(userId),
          xp: userResult.xp,
          isCurrentUser: true,
        };
      }

      xpArr = xpArr.slice(0, topLength - 1);
      xpArr.push(lastUser);
    }
    return xpArr.slice(0, topLength);
  }
  public async getUserXpThisWeek(
    currentUserId: string,
    followUserId: string,
  ): Promise<Statistic> {
    //  await this.generateXP();
    currentUserId = currentUserId.trim();
    followUserId = followUserId.trim();
    if (!currentUserId || !followUserId) {
      throw new BadRequestException(
        'currentUserId or followUserId not entered ',
      );
    }
    const startTime = dayjs().startOf('week').format();
    const endTime = dayjs().format();
    const filter = {
      user: {
        $in: [
          new Types.ObjectId(currentUserId),
          new Types.ObjectId(followUserId),
        ],
      },
      createdAt: {
        $gte: new Date(startTime),
        $lte: new Date(endTime),
      },
    };
    //xpArr = await this.getTotalXp(currentUserId, filter);
    const promises = await Promise.all([
      this.usersService.queryMe(followUserId),
      this.getTotalXp(currentUserId, filter),
      this.getXpStatistic(followUserId, startTime, endTime),
      this.getXpStatistic(currentUserId, startTime, endTime),
    ]);
    const followUser = promises[0];
    if (!followUser) {
      throw new BadRequestException('Can not find follow user');
    }
    const xpArr = promises[1];
    const followUserWeekStatistic = promises[2];
    const currentUserWeekStatistic = promises[3];

    const result: Statistic = {
      currentUserXp: -1,
      followUserXp: -1,
      followUserXpStatistic: followUserWeekStatistic,
      currentUserXpStatistic: currentUserWeekStatistic,
    };
    for (let i = 0; i < 2; i++) {
      if (i >= xpArr.length) {
        if (result.currentUserXp == -1) result.currentUserXp = 0;
        if (result.followUserXp == -1) result.followUserXp = 0;
      } else {
        if (xpArr[i].isCurrentUser) {
          result.currentUserXp = xpArr[i].xp;
        } else {
          result.followUserXp = xpArr[i].xp;
        }
      }
    }

    return result;
  }

  public async getXpStatisticByAddress(
    filter?: any,
    locationId?: number,
    location?: string,
  ): Promise<ScoreStatisticDocument[]> {
    let tempArr: ScoreStatisticDocument[];
    if (filter) {
      tempArr = await this.scoreStatisticModel
        .find(filter)
        .populate('user', ['displayName', 'avatar', 'address']);
    } else {
      tempArr = await this.scoreStatisticModel
        .find({})
        .populate('user', ['displayName', 'avatar', 'address']);
    }

    return tempArr.filter((i) => {
      const user = i.user as unknown as UserDocument;
      if (!user) return false;
      switch (location) {
        case Location.Province:
          return locationId === user.address.province;
        case Location.District:
          return locationId === user.address.district;
        case Location.All:
        default:
          return true;
      }
    });
  }

  private async getTotalXp(
    userId: string,
    filter?: any,
    locationId?: number,
    location?: string,
  ): Promise<UserRank[]> {
    try {
      const xpArr: UserRank[] = [];
      const tempArr: ScoreStatisticDocument[] =
        await this.getXpStatisticByAddress(filter, locationId, location);
      if (!tempArr || tempArr.length == 0) {
        return [];
      }
      tempArr.sort(function compareFn(firstEl, secondEl) {
        if (firstEl.user < secondEl.user) return -1;
        if (firstEl.user > secondEl.user) return 1;
        return 0;
      });

      let prevUser = this.scoreStatisticsHelper.getFirstUserNotNull(tempArr);
      let totalXp = 0;
      for (let i = 0; i < tempArr.length; i++) {
        // if (!prevUser) break;
        const item = tempArr[i];
        const currentUser = item.user as unknown as UserDocument;
        // if (!currentUser) continue;
        if (currentUser._id.toHexString() == prevUser._id.toHexString()) {
          totalXp += item.xp;
        } else {
          const userRank: UserRank = {
            orderNumber: 0,
            displayName: prevUser.displayName,
            avatar: prevUser.avatar,
            userId: prevUser._id,
            xp: totalXp,
            isCurrentUser: false,
          };
          if (userRank.userId.toHexString() == userId)
            userRank.isCurrentUser = true;

          xpArr.push(userRank);
          totalXp = 0;
          prevUser = currentUser;
          i--;
        }

        if (i == tempArr.length - 1) {
          const userRank: UserRank = {
            orderNumber: 0,
            displayName: prevUser.displayName,
            avatar: prevUser.avatar,
            userId: prevUser._id,
            xp: totalXp,
            isCurrentUser: false,
          };
          if (userRank.userId.toHexString() == userId)
            userRank.isCurrentUser = true;
          xpArr.push(userRank);
        }
      }
      xpArr.sort(function compareFn(firstEl, secondEl) {
        if (firstEl.xp < secondEl.xp) return 1;
        if (firstEl.xp > secondEl.xp) return -1;
        return 0;
      });

      return xpArr;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async addXpAfterSaveLesson(xp: number, userId: string): Promise<void> {
    try {
      const startTime = dayjs().startOf('day').format();
      const endTime = dayjs().format();
      const filter = {
        user: new Types.ObjectId(userId),
        createdAt: {
          $gte: new Date(startTime),
          $lte: new Date(endTime),
        },
      };
      const userXpRecord = await this.scoreStatisticModel.findOne(filter);
      if (userXpRecord) {
        await this.scoreStatisticModel.findOneAndUpdate(filter, {
          xp: userXpRecord.xp + xp,
        });
        return;
      }
      await new this.scoreStatisticModel({
        xp: xp,
        user: new Types.ObjectId(userId),
      }).save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getXpStatistic(
    userId: string,
    startTime: string,
    endTime: string,
  ): Promise<number[]> {
    const statisticLength = 7;
    const xpStatistic = await this.scoreStatisticModel.find({
      user: new Types.ObjectId(userId),
      createdAt: {
        $gte: new Date(startTime),
        $lte: new Date(endTime),
      },
    });
    const xpStatisticResult: number[] = new Array(statisticLength).fill(0);
    for (const item of xpStatistic) {
      xpStatisticResult[dayjs(item.createdAt).get('day')] = item.xp;
    }
    return xpStatisticResult;
  }

  public async findScoreStatisticRecords(
    userId: string,
  ): Promise<ScoreStatisticDocument[]> {
    const startDateAsString = dayjs()
      .startOf('day')
      .subtract(1, 'day')
      .format();
    const endDateAsString = dayjs().endOf('day').subtract(1, 'day').format();
    const startDate = new Date(startDateAsString);
    const endDate = new Date(endDateAsString);
    return this.scoreStatisticModel.find({
      user: Types.ObjectId(userId),
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  }
}
