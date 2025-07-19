import { ExamQuestion } from '@prisma/client';

export class ExamQuestionEntity implements ExamQuestion {
  examId: string;

  questionId: string;

  position: number | null;

  group: string | null;

  constructor(partial: Partial<ExamQuestionEntity>) {
    Object.assign(this, partial);
  }
} 