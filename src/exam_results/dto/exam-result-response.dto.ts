export class ExamResultResponseDto {
  id: string;
  examId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent?: number;
  startedAt?: Date;
  completedAt: Date;
  createdAt: Date;
}

export class UserAnswerResponseDto {
  id: string;
  examResultId: string;
  questionId: string;
  questionType: string;
  userAnswer?: string;
  userAnswers?: Record<string, string>;
  isCorrect: boolean;
  createdAt: Date;
}

export class SubmitExamResultResponseDto {
  code: number;
  message: string;
  data: {
    examResult: ExamResultResponseDto;
    correctAnswers: number;
    incorrectAnswers: number;
    unanswered: number;
  };
} 