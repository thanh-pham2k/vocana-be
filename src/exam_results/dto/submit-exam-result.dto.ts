import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum QuestionType {
  MCQ = 'mcq',
  FILL_IN_BLANK = 'fillInBlank',
  READING_MCQ = 'readingMcq',
  LISTENING_MCQ = 'listeningMcq',
}

export class UserAnswerDto {
  @IsString()
  questionId: string;

  @IsEnum(QuestionType)
  questionType: QuestionType;

  @IsOptional()
  @IsString()
  userAnswer?: string; // for mcq, fillInBlank

  @IsOptional()
  userAnswers?: Record<string, string>; // for readingMcq, listeningMcq
}

export class SubmitExamResultDto {
  @IsString()
  examId: string;

  @IsString()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserAnswerDto)
  answers: UserAnswerDto[];

  @IsNumber()
  @Min(0)
  score: number;

  @IsNumber()
  @Min(1)
  totalQuestions: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  timeSpent?: number; // seconds

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsDateString()
  completedAt: string;
} 