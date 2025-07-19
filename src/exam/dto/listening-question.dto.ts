import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { McqQuestionDto } from './mcq-question.dto';

export class ListeningQuestionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  audioFile: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => McqQuestionDto)
  mcqs: McqQuestionDto[];

  @IsOptional()
  @IsString()
  answerExplanation?: string;
} 