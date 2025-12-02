import type { QuestionBank, ExamAttempt, UserStats, ExamSession, Question, UserAnswer, ExamSection } from './types';

const STORAGE_KEYS = {
  QUESTION_BANKS: 'exam_portal_question_banks',
  ATTEMPTS: 'exam_portal_attempts',
  CURRENT_SESSION: 'exam_portal_current_session',
  USER_STATS: 'exam_portal_user_stats',
} as const;

export const storageService = {
  getQuestionBanks(): QuestionBank[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUESTION_BANKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveQuestionBank(bank: QuestionBank): void {
    const banks = this.getQuestionBanks();
    const existingIndex = banks.findIndex(b => b.id === bank.id);
    if (existingIndex >= 0) {
      banks[existingIndex] = bank;
    } else {
      banks.push(bank);
    }
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANKS, JSON.stringify(banks));
  },

  deleteQuestionBank(id: string): void {
    const banks = this.getQuestionBanks().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANKS, JSON.stringify(banks));
  },

  getQuestionBankById(id: string): QuestionBank | undefined {
    return this.getQuestionBanks().find(b => b.id === id);
  },

  getAttempts(): ExamAttempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAttempt(attempt: ExamAttempt): void {
    const attempts = this.getAttempts();
    const existingIndex = attempts.findIndex(a => a.id === attempt.id);
    if (existingIndex >= 0) {
      attempts[existingIndex] = attempt;
    } else {
      attempts.unshift(attempt);
    }
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    this.updateUserStats();
  },

  getAttemptsByBankId(bankId: string): ExamAttempt[] {
    return this.getAttempts().filter(a => a.questionBankId === bankId);
  },

  getAttemptById(id: string): ExamAttempt | undefined {
    return this.getAttempts().find(a => a.id === id);
  },

  getCurrentSession(): ExamSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (!data) return null;
      const session = JSON.parse(data);
      
      // Restore answers map
      const answersMap = new Map<number, string[]>();
      if (session.answers) {
        Object.entries(session.answers).forEach(([key, value]) => {
          answersMap.set(parseInt(key, 10), value as string[]);
        });
      }
      session.answers = answersMap;
      
      // Restore flagged questions set
      session.flaggedQuestions = new Set<number>(
        (session.flaggedQuestions || []).map((n: number | string) => 
          typeof n === 'string' ? parseInt(n, 10) : n
        )
      );
      
      // Restore hints used set
      session.hintsUsed = new Set<number>(
        (session.hintsUsed || []).map((n: number | string) => 
          typeof n === 'string' ? parseInt(n, 10) : n
        )
      );
      
      // Restore option orders map
      const optionOrdersMap = new Map<number, number[]>();
      if (session.optionOrders) {
        Object.entries(session.optionOrders).forEach(([key, value]) => {
          optionOrdersMap.set(parseInt(key, 10), value as number[]);
        });
      }
      session.optionOrders = optionOrdersMap;
      
      return session;
    } catch {
      return null;
    }
  },

  saveCurrentSession(session: ExamSession | null): void {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
      return;
    }
    
    // Serialize answers map
    const answersObj: Record<string, string[]> = {};
    session.answers.forEach((value, key) => {
      answersObj[key.toString()] = value;
    });
    
    // Serialize option orders map
    const optionOrdersObj: Record<string, number[]> = {};
    if (session.optionOrders) {
      session.optionOrders.forEach((value, key) => {
        optionOrdersObj[key.toString()] = value;
      });
    }
    
    const serializable = {
      ...session,
      answers: answersObj,
      flaggedQuestions: Array.from(session.flaggedQuestions),
      hintsUsed: session.hintsUsed ? Array.from(session.hintsUsed) : [],
      optionOrders: optionOrdersObj,
    };
    
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(serializable));
  },

  clearCurrentSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  },

  getUserStats(): UserStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_STATS);
      return data ? JSON.parse(data) : {
        totalAttempts: 0,
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        averageScore: 0,
      };
    } catch {
      return {
        totalAttempts: 0,
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        averageScore: 0,
      };
    }
  },

  updateUserStats(): void {
    const attempts = this.getAttempts().filter(a => a.completed);
    const stats: UserStats = {
      totalAttempts: attempts.length,
      totalQuestionsAnswered: attempts.reduce((sum, a) => sum + a.totalQuestions, 0),
      totalCorrect: attempts.reduce((sum, a) => sum + a.correctCount, 0),
      averageScore: attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
        : 0,
      lastAttemptDate: attempts[0]?.endTime,
    };
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
  },

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  exportAllData(): string {
    const data = {
      questionBanks: this.getQuestionBanks(),
      attempts: this.getAttempts(),
      userStats: this.getUserStats(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.questionBanks) {
        localStorage.setItem(STORAGE_KEYS.QUESTION_BANKS, JSON.stringify(data.questionBanks));
      }
      if (data.attempts) {
        localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(data.attempts));
      }
      this.updateUserStats();
      return true;
    } catch {
      return false;
    }
  },

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },

  parseCorrectAnswers(correctAnswer: string | string[]): string[] {
    if (Array.isArray(correctAnswer)) {
      return correctAnswer.map(a => a.trim().toLowerCase());
    }
    return correctAnswer.split(',').map(a => a.trim().toLowerCase());
  },

  checkAnswer(question: Question, selectedAnswers: string[]): boolean {
    const correctAnswers = this.parseCorrectAnswers(question.correct_answer);
    const normalizedSelected = selectedAnswers.map(a => a.trim().toLowerCase());
    
    // Must have same number of answers
    if (normalizedSelected.length !== correctAnswers.length) return false;
    
    // Sort both arrays for comparison
    const sortedCorrect = [...correctAnswers].sort();
    const sortedSelected = [...normalizedSelected].sort();
    
    // Check if all answers match
    return sortedCorrect.every((answer, idx) => answer === sortedSelected[idx]);
  },

  isMultiSelect(question: Question): boolean {
    if (Array.isArray(question.correct_answer)) {
      return question.correct_answer.length > 1;
    }
    return question.correct_answer.includes(',');
  },

  getCorrectAnswersDisplay(question: Question): string[] {
    if (Array.isArray(question.correct_answer)) {
      return question.correct_answer;
    }
    return question.correct_answer.split(',').map(a => a.trim());
  },

  // Shuffle array using Fisher-Yates algorithm
  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Generate shuffled question order
  generateQuestionOrder(questionCount: number, shuffle: boolean): number[] {
    const order = Array.from({ length: questionCount }, (_, i) => i);
    return shuffle ? this.shuffleArray(order) : order;
  },

  // Generate shuffled option order for a question
  generateOptionOrder(optionCount: number, shuffle: boolean): number[] {
    const order = Array.from({ length: optionCount }, (_, i) => i);
    return shuffle ? this.shuffleArray(order) : order;
  },

  // Calculate weighted score
  calculateWeightedScore(answers: UserAnswer[], questions: Question[]): {
    totalPoints: number;
    earnedPoints: number;
    score: number;
  } {
    let totalPoints = 0;
    let earnedPoints = 0;

    answers.forEach((answer) => {
      const question = questions[answer.questionIndex];
      const weight = question?.weight || 1;
      totalPoints += weight;
      if (answer.isCorrect) {
        earnedPoints += weight;
      }
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    return { totalPoints, earnedPoints, score };
  },

  // Calculate section scores
  calculateSectionScores(
    answers: UserAnswer[],
    questions: Question[],
    sections?: ExamSection[]
  ): { section: string; score: number; weight: number }[] {
    if (!sections || sections.length === 0) return [];

    const sectionResults = sections.map((section) => {
      const sectionQuestions = questions
        .map((q, idx) => ({ question: q, index: idx }))
        .filter(({ question }) => question.section === section.name);

      const sectionAnswers = answers.filter((a) =>
        sectionQuestions.some((sq) => sq.index === a.questionIndex)
      );

      let totalPoints = 0;
      let earnedPoints = 0;

      sectionAnswers.forEach((answer) => {
        const question = questions[answer.questionIndex];
        const weight = question?.weight || 1;
        totalPoints += weight;
        if (answer.isCorrect) {
          earnedPoints += weight;
        }
      });

      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

      return {
        section: section.name,
        score,
        weight: section.weight,
      };
    });

    return sectionResults;
  },
};
