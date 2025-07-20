import { Controller, Post, Get, Body, Param, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ExamResultsService } from './exam-results.service';
import { SubmitExamResultDto } from './dto/submit-exam-result.dto';
import { SubmitExamResultResponseDto } from './dto/exam-result-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exam-results')
@UseGuards(JwtAuthGuard)
export class ExamResultsController {
  constructor(private readonly examResultsService: ExamResultsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async submitExamResult(@Body() submitExamResultDto: SubmitExamResultDto): Promise<SubmitExamResultResponseDto> {
    return this.examResultsService.submitExamResult(submitExamResultDto);
  }

  @Get('exam/:examId')
  async getExamResults(
    @Param('examId') examId: string,
    @Query('userId') userId?: string
  ) {
    return this.examResultsService.getExamResults(examId, userId);
  }

  @Get('user/:userId')
  async getUserExamResults(@Param('userId') userId: string) {
    return this.examResultsService.getUserExamResults(userId);
  }
} 