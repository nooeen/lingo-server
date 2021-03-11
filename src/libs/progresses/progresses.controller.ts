import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('progresses')
@Controller('progresses')
export class ProgressesController {
  constructor(private readonly progressesService: ProgressesService) {}

  @Post()
  create(@Body() createProgressDto: CreateProgressDto) {
    return this.progressesService.create(createProgressDto);
  }

  @Get()
  findAll() {
    return this.progressesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.progressesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProgressDto: UpdateProgressDto) {
    return this.progressesService.update(+id, updateProgressDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.progressesService.remove(+id);
  }
}
