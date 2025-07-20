import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitExamResultDto, QuestionType } from './dto/submit-exam-result.dto';
import { SubmitExamResultResponseDto } from './dto/exam-result-response.dto';

@Injectable()
export class ExamResultsService {
  private readonly logger = new Logger(ExamResultsService.name);

  constructor(private prisma: PrismaService) {}

  async submitExamResult(submitDto: SubmitExamResultDto): Promise<SubmitExamResultResponseDto> {
    this.logger.log('Submitting exam result', { examId: submitDto.examId, userId: submitDto.userId });

    // Validate exam exists
    const exam = await this.prisma.exam.findUnique({
      where: { id: submitDto.examId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: submitDto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all questions for the exam to validate answers
    const examQuestions = await this.prisma.question.findMany({
      where: { examId: submitDto.examId },
    });

    if (examQuestions.length === 0) {
      throw new BadRequestException('No questions found for this exam');
    }

    // Validate answers and calculate score
    const { validatedAnswers, correctCount, totalAnswered } = await this.validateAnswers(
      submitDto.answers,
      examQuestions
    );

    // Calculate percentage
    const percentage = submitDto.totalQuestions > 0 
      ? Math.round((submitDto.score / submitDto.totalQuestions) * 100 * 100) / 100 
      : 0;

    // Create exam result using transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create exam result
      const examResult = await tx.examResult.create({
        data: {
          examId: submitDto.examId,
          userId: submitDto.userId,
          score: submitDto.score,
          totalQuestions: submitDto.totalQuestions,
          timeSpent: submitDto.timeSpent,
          startedAt: submitDto.startedAt ? new Date(submitDto.startedAt) : null,
          completedAt: new Date(submitDto.completedAt),
        },
      });

      // Create user answers
      const userAnswersData = validatedAnswers.map(answer => ({
        examResultId: examResult.id,
        questionId: answer.questionId,
        questionType: answer.questionType,
        userAnswer: answer.userAnswer || null,
        userAnswers: answer.userAnswers || null,
        isCorrect: answer.isCorrect,
      }));

      await tx.userAnswer.createMany({
        data: userAnswersData,
      });

      return examResult;
    });

    this.logger.log('Exam result submitted successfully', { examResultId: result.id });

    return {
      code: 0,
      message: 'Exam result submitted successfully',
      data: {
        examResult: {
          id: result.id,
          examId: result.examId,
          userId: result.userId,
          score: result.score,
          totalQuestions: result.totalQuestions,
          percentage: percentage,
          timeSpent: result.timeSpent ?? undefined,
          startedAt: result.startedAt ?? undefined,
          completedAt: result.completedAt,
          createdAt: result.createdAt,
        },
        correctAnswers: correctCount,
        incorrectAnswers: totalAnswered - correctCount,
        unanswered: submitDto.totalQuestions - totalAnswered,
      },
    };
  }

  private async validateAnswers(
    userAnswers: any[],
    examQuestions: any[]
  ): Promise<{
    validatedAnswers: any[];
    correctCount: number;
    totalAnswered: number;
  }> {
    const validatedAnswers = [];
    let correctCount = 0;
    let totalAnswered = 0;

    // Create a map of question ID to question for efficient lookup
    const questionMap = new Map(examQuestions.map(q => [q.id, q]));

    for (const userAnswer of userAnswers) {
      const question = questionMap.get(userAnswer.questionId);
      
      if (!question) {
        this.logger.warn('Question not found for answer', { questionId: userAnswer.questionId });
        continue;
      }

      totalAnswered++;
      let isCorrect = false;

      // Validate answer based on question type
      switch (userAnswer.questionType) {
        case QuestionType.MCQ:
        case QuestionType.FILL_IN_BLANK:
          isCorrect = this.validateSimpleAnswer(userAnswer.userAnswer, question.correctAnswer);
          break;
        
        case QuestionType.READING_MCQ:
        case QuestionType.LISTENING_MCQ:
          isCorrect = await this.validateNestedAnswer(
            userAnswer.userAnswers,
            question.parentId || question.id,
            questionMap
          );
          break;
        
        default:
          this.logger.warn('Unknown question type', { questionType: userAnswer.questionType });
      }

      if (isCorrect) {
        correctCount++;
      }

      validatedAnswers.push({
        questionId: userAnswer.questionId,
        questionType: userAnswer.questionType,
        userAnswer: userAnswer.userAnswer,
        userAnswers: userAnswer.userAnswers,
        isCorrect,
      });
    }

    return { validatedAnswers, correctCount, totalAnswered };
  }

  private validateSimpleAnswer(userAnswer: string, correctAnswer: string): boolean {
    if (!userAnswer || !correctAnswer) {
      return false;
    }
    return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  }

  private async validateNestedAnswer(
    userAnswers: Record<string, string>,
    parentQuestionId: string,
    questionMap: Map<string, any>
  ): Promise<boolean> {
    if (!userAnswers || typeof userAnswers !== 'object') {
      return false;
    }

    // Get all child questions for this parent
    const childQuestions = Array.from(questionMap.values()).filter(
      q => q.parentId === parentQuestionId
    );

    if (childQuestions.length === 0) {
      return false;
    }

    let correctAnswersCount = 0;
    let totalAnswers = 0;

    for (const childQuestion of childQuestions) {
      const userAnswer = userAnswers[childQuestion.id];
      if (userAnswer && childQuestion.correctAnswer) {
        totalAnswers++;
        if (this.validateSimpleAnswer(userAnswer, childQuestion.correctAnswer)) {
          correctAnswersCount++;
        }
      }
    }

    // Consider correct if all answers are correct
    return totalAnswers > 0 && correctAnswersCount === totalAnswers;
  }

  async getExamResults(examId: string, userId?: string) {
    const where: any = { examId };
    if (userId) {
      where.userId = userId;
    }

    const examResults = await this.prisma.examResult.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
          },
        },
        userAnswers: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    return {
      code: 0,
      message: 'Success',
      data: {
        total: examResults.length,
        items: examResults,
      },
    };
  }

  async getUserExamResults(userId: string) {
    const examResults = await this.prisma.examResult.findMany({
      where: { userId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            level: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    });

    return {
      code: 0,
      message: 'Success',
      data: {
        total: examResults.length,
        items: examResults,
      },
    };
  }
} 