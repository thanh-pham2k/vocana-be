import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { McqQuestionDto } from './mcq-question.dto';

export class ReadingQuestionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  passage: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => McqQuestionDto)
  mcqs: McqQuestionDto[];
} 