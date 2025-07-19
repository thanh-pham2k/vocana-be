import { IsJSON, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  questionType: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  skill?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsJSON()
  options?: any;

  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @IsOptional()
  @IsString()
  sampleAnswer?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  topic?: string;
}
