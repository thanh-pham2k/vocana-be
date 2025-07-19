import { IsString, IsInt, IsOptional, IsArray, ValidateNested, IsEnum, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

enum ExamQuestionType {
  MCQ = 'mcq',
  READING = 'reading',
  LISTENING = 'listening',
  FILL_IN_THE_BLANK = 'fillInTheBlank',
}

class McqOptionDto {
  @IsString()
  answer: string;
}

class McqQuestionDto {
  @IsString()
  question: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsString()
  correct: string;

  @IsOptional()
  @IsString()
  answerExplanation?: string;
}

class ReadingMcqDto {
  @IsString()
  question: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsString()
  correct: string;

  @IsOptional()
  @IsString()
  answerExplanation?: string;
}

class ReadingQuestionDto {
  @IsString()
  passage: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReadingMcqDto)
  mcqs: ReadingMcqDto[];
}

class ListeningMcqDto {
  @IsString()
  question: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsString()
  correct: string;

  @IsOptional()
  @IsString()
  answerExplanation?: string;
}

class ListeningQuestionDto {
  @IsUrl()
  audioFile: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListeningMcqDto)
  mcqs: ListeningMcqDto[];

  @IsOptional()
  @IsString()
  answerExplanation?: string;
}

class FillInTheBlankAnswerDto {
  @IsString()
  answer: string;
}

class FillInTheBlankQuestionDto {
  @IsString()
  question: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FillInTheBlankAnswerDto)
  answers: FillInTheBlankAnswerDto[];

  @IsOptional()
  @IsString()
  answerExplanation?: string;
}

export class CreateExamQuestionDto {
  @IsEnum(ExamQuestionType)
  type: ExamQuestionType;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => McqQuestionDto)
  mcqQuestions?: McqQuestionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReadingQuestionDto)
  readingQuestions?: ReadingQuestionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListeningQuestionDto)
  listeningQuestions?: ListeningQuestionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FillInTheBlankQuestionDto)
  fillInTheBlankQuestions?: FillInTheBlankQuestionDto[];
}