import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  create(createQuestionDto: CreateQuestionDto) {
    return this.prisma.question.create({ data: createQuestionDto });
  }

  findAll() {
    return this.prisma.question.findMany();
  }

  findOne(id: string) {
    return this.prisma.question.findUnique({ where: { id } });
  }

  update(id: string, updateQuestionDto: UpdateQuestionDto) {
    return this.prisma.question.update({ where: { id }, data: updateQuestionDto });
  }

  remove(id: string) {
    return this.prisma.question.delete({ where: { id } });
  }
}
