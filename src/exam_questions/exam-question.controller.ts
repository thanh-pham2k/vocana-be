import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExamQuestionService } from './exam-question.service';
import { CreateExamQuestionDto } from './dto/create-exam-question.dto';
import { UpdateExamQuestionDto } from './dto/update-exam-question.dto';

@Controller('exam-questions')
export class ExamQuestionController {
  constructor(private readonly examQuestionService: ExamQuestionService) {}

  @Post()
  create(@Body() createExamQuestionDto: CreateExamQuestionDto) {
    return this.examQuestionService.create(createExamQuestionDto);
  }

  @Get()
  findAll() {
    return this.examQuestionService.findAll();
  }

  @Get(':examId/:questionId')
  findOne(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.examQuestionService.findOne(examId, questionId);
  }

  @Patch(':examId/:questionId')
  update(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
    @Body() updateExamQuestionDto: UpdateExamQuestionDto,
  ) {
    return this.examQuestionService.update(
      examId,
      questionId,
      updateExamQuestionDto,
    );
  }

  @Delete(':examId/:questionId')
  remove(
    @Param('examId') examId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.examQuestionService.remove(examId, questionId);
  }
} 