export interface Question {
  question: string;
  options: string[];
  correct_answer: string | string[];
  explanation?: string;
  references?: string[];
  hint?: string;
}

export interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  dateAdded: string;
}

export interface UserAnswer {
  questionIndex: number;
  selectedOptions: string[];
  isCorrect: boolean;
  timeTaken?: number;
}

export interface ExamAttempt {
  id: string;
  questionBankId: string;
  questionBankName: string;
  mode: 'exam' | 'practice';
  startTime: string;
  endTime?: string;
  answers: UserAnswer[];
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  score: number;
  completed: boolean;
}

export interface ExamSession {
  id: string;
  questionBankId: string;
  questionBankName: string;
  mode: 'exam' | 'practice';
  currentQuestionIndex: number;
  answers: Map<number, string[]>;
  flaggedQuestions: Set<number>;
  startTime: string;
  timeLimit?: number;
}

export interface UserStats {
  totalAttempts: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  averageScore: number;
  lastAttemptDate?: string;
}

export type ExamMode = 'exam' | 'practice';
