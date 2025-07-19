import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExamService {

  logger = new Logger(ExamService.name);
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new exam and its questions in a step-by-step manner.
   * 
   * @param payload - An object with "exam" (main exam data) and "questions" (all question groups)
   * Example:
   * {
   *   exam: { ... },
   *   questions: {
   *     mcqQuestions: [...],
   *     readingQuestions: [...],
   *     listeningQuestions: [...],
   *     fillInTheBlankQuestions: [...]
   *   }
   * }
   */
  async create(payload: {
    exam: {
      title: string;
      description?: string;
      level?: string;
      duration?: number;
      created_by?: string;
      type?: string;
    },
    questions: {
      mcqQuestions?: any[];
      readingQuestions?: any[];
      listeningQuestions?: any[];
      fillInTheBlankQuestions?: any[];
    }
  }) {
    this.logger.log("create", payload);
    // Step 1: Create the main exam record
    const createdExam = await this.createExamRecord(payload.exam);
    console.log(createdExam);

    await this.createMcqQuestions(payload.questions.mcqQuestions, createdExam.id);
    await this.createReadingQuestions(payload.questions.readingQuestions, createdExam.id);
    await this.createListeningQuestions(payload.questions.listeningQuestions, createdExam.id);
    await this.createFillInTheBlankQuestions(payload.questions.fillInTheBlankQuestions, createdExam.id);

    return {
      code: 0,
      message: 'success',
    };
  }

  private async createMcqQuestions(mcqQuestions: any[] | undefined, examId: string) {
    if (mcqQuestions && Array.isArray(mcqQuestions)) {
      for (const mcq of mcqQuestions) {
        await this.prisma.question.create({
          data: {
            content: mcq.question,
            options: mcq.options,
            correctAnswer: mcq.correct,
            explanation: mcq.answerExplanation,
            position: mcq.position,
            questionType: 'MCQ',
            examId: examId,
          },
        });
      }
    }
  }

  private async createReadingQuestions(readingQuestions: any[] | undefined, examId: string) {
    if (readingQuestions && Array.isArray(readingQuestions)) {
      for (const readingQuestion of readingQuestions) {
        // Create the parent reading question (the passage)
        const createdReadingQuestion = await this.prisma.question.create({
          data: {
            content: readingQuestion.passage,
            mediaUrl: readingQuestion.image,
            questionType: 'READING',
            examId: examId,
            position: readingQuestion.position,
          },
        });

        // Create nested MCQ questions linked to the reading passage
        if (readingQuestion.mcqs && Array.isArray(readingQuestion.mcqs)) {
          for (let index = 0; index < readingQuestion.mcqs.length; index++) {
            const mcq = readingQuestion.mcqs[index];
            await this.prisma.question.create({
              data: {
                content: mcq.question,
                options: mcq.options,
                correctAnswer: mcq.correct,
                explanation: mcq.answerExplanation,
                questionType: 'MCQ',
                examId: examId,
                parentId: createdReadingQuestion.id,
                position: index + 1,
              },
            });
          }
        }
      }
    }
  }

  private async createListeningQuestions(listeningQuestions: any[] | undefined, examId: string) {
    if (listeningQuestions && Array.isArray(listeningQuestions)) {
      for (const listeningQuestion of listeningQuestions) {
        // Create the parent listening question (the audio prompt)
        const createdListeningQuestion = await this.prisma.question.create({
          data: {
            content: '', // No textual content, just audio
            mediaUrl: listeningQuestion.audioFile,
            questionType: 'LISTENING',
            examId: examId,
            explanation: listeningQuestion.answerExplanation,
            position: listeningQuestion.position,
          },
        });

        // Create nested MCQ questions linked to the listening prompt
        if (listeningQuestion.mcqs && Array.isArray(listeningQuestion.mcqs)) {
          for (let index = 0; index < listeningQuestion.mcqs.length; index++) {
            const mcq = listeningQuestion.mcqs[index];
            await this.prisma.question.create({
              data: {
                content: mcq.question,
                options: mcq.options,
                correctAnswer: mcq.correct,
                explanation: mcq.answerExplanation,
                questionType: 'MCQ',
                examId: examId,
                parentId: createdListeningQuestion.id,
                position: index + 1,
              },
            });
          }
        }
      }
    }
  }

  private async createFillInTheBlankQuestions(fillInTheBlankQuestions: any[] | undefined, examId: string) {
    if (fillInTheBlankQuestions && Array.isArray(fillInTheBlankQuestions)) {
      for (const fillInQuestion of fillInTheBlankQuestions) {
        const answerList = Array.isArray(fillInQuestion.answers)
          ? fillInQuestion.answers.map((ans: { answer: string }) => ans.answer)
          : [];

        await this.prisma.question.create({
          data: {
            content: fillInQuestion.question,
            correctAnswer: answerList.length === 1 ? answerList[0] : JSON.stringify(answerList),
            explanation: fillInQuestion.answerExplanation,
            questionType: 'FILL_IN_THE_BLANK',
            examId: examId,
            position: fillInQuestion.position,
          },
        });
      }
    }
  }

  private async createExamRecord(examDetails: {
    title: string;
    description?: string;
    level?: string;
    duration?: number;
    created_by?: string;
  }) {
    this.logger.log("createExamRecord", examDetails);
    return this.prisma.exam.create({
      data: {
        title: examDetails.title,
        description: examDetails.description,
        level: examDetails.level,
        duration: examDetails.duration,
        createdBy: examDetails.created_by,
      },
    });
  }

  async findAllExams() {
    const examList = await this.prisma.exam.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    return {
      code: 0,
      message: 'Success',
      data: {
        total: examList.length,
        items: examList.map((exam) => ({
          id: exam.id,
          title: exam.title,
          description: exam.description,
          level: exam.level,
          duration: exam.duration,
          createdBy: exam.createdBy,
          createdAt: exam.createdAt,
        })),
      },
    };
  }

  async getExamDetail(examId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return {
        code: 1,
        message: 'Exam not found',
        data: null,
      };
    }

    // Fetch all questions for the exam
    const questionList = await this.prisma.question.findMany({
      where: { examId: examId }
    });

    const mcqQuestions = this.extractMcqQuestions(questionList);
    const readingQuestions = this.extractReadingQuestions(questionList);
    const listeningQuestions = this.extractListeningQuestions(questionList);
    const fillInTheBlankQuestions = this.extractFillInTheBlankQuestions(questionList);

    return {
      code: 0,
      message: 'Success',
      data: {
        exam: {
          title: exam.title,
          description: exam.description,
          level: exam.level,
          duration: exam.duration,
          created_by: exam.createdBy,
        },
        questions: {
          mcqQuestions,
          readingQuestions,
          listeningQuestions,
          fillInTheBlankQuestions,
        },
      },
    };
  }

  private isMcqQuestion(question: any): boolean {
    return (
      (question.questionType?.toLowerCase?.() === 'mcq' || question.questionType === 'MCQ') &&
      !question.parentId
    );
  }

  private isReadingQuestion(question: any): boolean {
    return (
      question.questionType?.toLowerCase?.() === 'reading' || question.questionType === 'READING'
    );
  }

  private isListeningQuestion(question: any): boolean {
    return (
      question.questionType?.toLowerCase?.() === 'listening' || question.questionType === 'LISTENING'
    );
  }

  private isFillInTheBlankQuestion(question: any): boolean {
    return (
      question.questionType?.toLowerCase?.() === 'fill_in_the_blank' ||
      question.questionType === 'FILL_IN_THE_BLANK'
    );
  }

  private extractMcqQuestions(questionList: any[]): any[] {
    return questionList
      .filter((q) => this.isMcqQuestion(q) && (q.parentId === null || q.parentId === undefined))
      .map((q) => ({
        id: q.id,
        question: q.content,
        options: this.extractOptions(q.options),
        correct: q.correctAnswer,
        answerExplanation: q.explanation,
        position: q.position,
      }));
  }

  private extractReadingQuestions(questionList: any[]): any[] {
    return questionList
      .filter((question) => this.isReadingQuestion(question))
      .map((readingQuestion) => {
        const mcqList = questionList
          .filter(
            (question) =>
              question.parentId != null &&
              readingQuestion.id != null &&
              String(question.parentId) === String(readingQuestion.id) &&
              (question.questionType?.toLowerCase?.() === 'mcq' || question.questionType === 'MCQ')
          )
          .map((mcq) => ({
            id: mcq.id,
            question: mcq.content,
            options: this.extractOptions(mcq.options),
            correct: mcq.correctAnswer,
            answerExplanation: mcq.explanation,
            position: mcq.position,
          }));
        return {
          passage: readingQuestion.content,
          image: readingQuestion.mediaUrl,
          mcqs: mcqList,
          position: readingQuestion.position,
        };
      });
  }

  private extractListeningQuestions(questionList: any[]): any[] {
    return questionList
      .filter((q) => this.isListeningQuestion(q))
      .map((listening) => {
        const mcqs = questionList
          .filter(
            (q) =>
              q.parentId === listening.id &&
              (q.questionType?.toLowerCase?.() === 'mcq' || q.questionType === 'MCQ')
          )
          .map((q) => ({
            id: q.id,
            question: q.content,
            options: this.extractOptions(q.options),
            correct: q.correctAnswer,
            answerExplanation: q.explanation,
            position: q.position,
          }));
        return {
          audioFile: listening.mediaUrl,
          mcqs,
          answerExplanation: listening.explanation,
          position: listening.position,
        };
      });
  }

  private extractFillInTheBlankQuestions(questionList: any[]): any[] {
    return questionList
      .filter((q) => this.isFillInTheBlankQuestion(q))
      .map((q) => ({
        id: q.id,
        question: q.content,
        answers: this.extractFillInAnswers(q),
        answerExplanation: q.explanation,
        position: q.position,
      }));
  }

  private extractOptions(options: any): any[] {
    // options can be array, object, or stringified array/object
    if (Array.isArray(options)) {
      return options;
    }
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        if (Array.isArray(parsed)) return parsed;
        if (parsed?.options && Array.isArray(parsed.options)) return parsed.options;
        return [];
      } catch {
        return [];
      }
    }
    if (options && typeof options === 'object') {
      if (Array.isArray(options.options)) return options.options;
      if (Array.isArray(options)) return options;
    }
    return [];
  }

  private extractFillInAnswers(q: any): any[] {
    // Try to extract answers from options or correctAnswer
    if (Array.isArray(q.options)) {
      return q.options.map((ans: any) => ({ answer: ans }));
    }
    if (typeof q.options === 'string') {
      try {
        const parsed = JSON.parse(q.options);
        if (Array.isArray(parsed)) {
          return parsed.map((ans: any) => ({ answer: ans }));
        }
        if (parsed?.answers && Array.isArray(parsed.answers)) {
          return parsed.answers.map((ans: any) => ({ answer: ans }));
        }
      } catch {
        // ignore
      }
    }
    if (q.options && typeof q.options === 'object' && Array.isArray(q.options.answers)) {
      return q.options.answers.map((ans: any) => ({ answer: ans }));
    }
    if (q.correctAnswer) {
      return [{ answer: q.correctAnswer }];
    }
    return [];
  }

}
