import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExamQuestionService {
  constructor(private prisma: PrismaService) {}

  async create(createExamQuestionDto: any) {
    return this.prisma.examQuestion.create({ data: createExamQuestionDto });
  }

  async findAll() {
    return this.prisma.examQuestion.findMany();
  }

  async findOne(examId: string, questionId: string) {
    const examQuestion = await this.prisma.examQuestion.findUnique({
      where: { examId_questionId: { examId, questionId } },
    });
    if (!examQuestion) {
      throw new NotFoundException(
        `ExamQuestion with examId ${examId} and questionId ${questionId} not found`,
      );
    }
    return examQuestion;
  }

  async update(
    examId: string,
    questionId: string,
    updateExamQuestionDto: any,
  ) {
    const existingExamQuestion = await this.prisma.examQuestion.findUnique({
      where: { examId_questionId: { examId, questionId } },
    });
    if (!existingExamQuestion) {
      throw new NotFoundException(
        `ExamQuestion with examId ${examId} and questionId ${questionId} not found`,
      );
    }
    return this.prisma.examQuestion.update({
      where: { examId_questionId: { examId, questionId } },
      data: updateExamQuestionDto,
    });
  }

  async remove(examId: string, questionId: string) {
    const existingExamQuestion = await this.prisma.examQuestion.findUnique({
      where: { examId_questionId: { examId, questionId } },
    });
    if (!existingExamQuestion) {
      throw new NotFoundException(
        `ExamQuestion with examId ${examId} and questionId ${questionId} not found`,
      );
    }
    return this.prisma.examQuestion.delete({
      where: { examId_questionId: { examId, questionId } },
    });
  }
} 