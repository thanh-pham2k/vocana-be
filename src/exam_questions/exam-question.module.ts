import { Module } from '@nestjs/common';
import { ExamQuestionService } from './exam-question.service';
import { ExamQuestionController } from './exam-question.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExamQuestionController],
  providers: [ExamQuestionService],
})
export class ExamQuestionModule {} 