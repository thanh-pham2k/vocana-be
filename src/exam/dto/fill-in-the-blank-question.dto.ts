import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FillInTheBlankAnswerDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  answer: string;
}

export class FillInTheBlankQuestionDto {
  @IsOptional()
  @IsString()
  id?: string;

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