export interface Question {
  question: string;
  options: string[] | Record<string, string>; // Array or object with A, B, C, D keys
  correct_answer: string | string[]; // Can be "A", "A, B", or full text
  explanation?: string;
  references?: string[];
  hint?: string;
  section?: string;
  weight?: number; // Points for this question (default: 1)
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface ExamSection {
  name: string;
  description?: string;
  weight: number; // Percentage weight of this section (e.g., 30 for 30%)
  questionCount?: number; // Number of questions in this section
}

export interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  dateAdded: string;
  sections?: ExamSection[]; // Optional exam sections with weights
  shuffleQuestions?: boolean; // Whether to shuffle questions in exam mode
  shuffleOptions?: boolean; // Whether to shuffle answer options
  passingScore?: number; // Minimum score to pass (percentage)
  timeLimit?: number; // Time limit in minutes
}

export interface UserAnswer {
  questionIndex: number;
  selectedOptions: string[];
  isCorrect: boolean;
  timeTaken?: number;
  pointsEarned?: number;
  pointsPossible?: number;
  section?: string;
  usedHint?: boolean;
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
  totalPoints?: number;
  earnedPoints?: number;
  sectionScores?: { section: string; score: number; weight: number }[];
  passed?: boolean;
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
  questionOrder?: number[]; // Shuffled question indices
  optionOrders?: Map<number, number[]>; // Shuffled option indices per question
  hintsUsed?: Set<number>; // Track which questions had hints revealed
}

export interface UserStats {
  totalAttempts: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  averageScore: number;
  lastAttemptDate?: string;
}

export type ExamMode = 'exam' | 'practice';
