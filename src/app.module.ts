import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { UserRolesModule } from './user_roles/user_roles.module';
import { QuestionsModule } from './questions/questions.module';
import { PrismaModule } from './prisma/prisma.module';
import { ExamModule } from './exam/exam.module';
import { ExamQuestionModule } from './exam_questions/exam-question.module';
import { ExamResultsModule } from './exam_results/exam-results.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    UserRolesModule,
    QuestionsModule,
    PrismaModule,
    ExamModule,
    ExamQuestionModule,
    ExamResultsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
