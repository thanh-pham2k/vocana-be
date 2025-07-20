import { ExamResult } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class ExamResultEntity implements ExamResult {
  id: string;
  examId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: Decimal | null;
  timeSpent: number | null;
  startedAt: Date | null;
  completedAt: Date;
  createdAt: Date;

  constructor(partial: Partial<ExamResultEntity>) {
    Object.assign(this, partial);
  }
} 