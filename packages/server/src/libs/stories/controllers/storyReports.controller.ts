import { JwtPayLoad } from '@utils/types';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { StoryReportsService } from '../providers/storyReports.service';
import { CreateStoryReportDto } from '@dto/stories';
import { StoryReport } from '@entities/storyReport.entity';
import { UserCtx } from '@utils/decorators/custom.decorator';

@Controller('api/story')
@ApiTags('Stories')
export class StoryReportsController {
  constructor(private readonly storyReportsService: StoryReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('report/create')
  @ApiOperation({ summary: 'Báo cáo lỗi story' })
  @ApiBody({ type: CreateStoryReportDto, required: true })
  @ApiBearerAuth()
  @ApiResponse({ type: StoryReport, status: 201 })
  async createStoryReport(
    @UserCtx() user: JwtPayLoad,
    @Body() body: CreateStoryReportDto,
  ) {
    return this.storyReportsService.create(user.userId, body);
  }
}
