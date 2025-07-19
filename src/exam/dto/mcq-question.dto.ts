import { IsArray, IsOptional, IsString } from 'class-validator';

export class McqQuestionDto {
  @IsOptional()
  @IsString()
  id?: string;

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