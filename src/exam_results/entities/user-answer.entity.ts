import { UserAnswer } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

export class UserAnswerEntity implements UserAnswer {
  id: string;
  examResultId: string;
  questionId: string;
  questionType: string;
  userAnswer: string | null;
  userAnswers: JsonValue | null;
  isCorrect: boolean;
  createdAt: Date;

  constructor(partial: Partial<UserAnswerEntity>) {
    Object.assign(this, partial);
  }
} 