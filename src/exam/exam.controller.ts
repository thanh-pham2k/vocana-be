import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exam')
@UseGuards(JwtAuthGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  create(@Body() createExamDto: any) {
    return this.examService.create(createExamDto);
  }

  @Get()
  findAllExams() {
    return this.examService.findAllExams();
  }

  @Get(':id')
  getExamDetail(@Param('id') id: string) {
    return this.examService.getExamDetail(id);
  }
}
