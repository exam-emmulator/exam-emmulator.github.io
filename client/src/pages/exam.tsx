import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Home,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  AlertTriangle,
} from "lucide-react";
import { storageService } from "@/lib/storage";
import type { Question, QuestionBank, ExamAttempt, UserAnswer, ExamMode, ExamSession } from "@/lib/types";

interface ExamPageProps {
  mode: ExamMode;
}

export default function ExamPage({ mode }: ExamPageProps) {
  const { bankId } = useParams<{ bankId: string }>();
  const [, setLocation] = useLocation();
  
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string[]>>(new Map());
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [practiceAnswered, setPracticeAnswered] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState(new Date().toISOString());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [attemptId, setAttemptId] = useState(storageService.generateId());
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [optionOrders, setOptionOrders] = useState<Map<number, number[]>>(new Map());
  const [hintsRevealed, setHintsRevealed] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!bankId) {
      setLocation('/');
      return;
    }
    const bank = storageService.getQuestionBankById(bankId);
    if (!bank) {
      setLocation('/');
      return;
    }
    setQuestionBank(bank);

    // Try to resume existing session
    const existingSession = storageService.getCurrentSession();
    if (existingSession && existingSession.questionBankId === bankId && existingSession.mode === mode) {
      // Resume session
      setCurrentIndex(existingSession.currentQuestionIndex);
      setAnswers(existingSession.answers);
      setFlagged(existingSession.flaggedQuestions);
      setQuestionOrder(existingSession.questionOrder || []);
      setOptionOrders(existingSession.optionOrders || new Map());
      setHintsRevealed(existingSession.hintsUsed || new Set());
      
      // Calculate elapsed time
      const startTime = new Date(existingSession.startTime).getTime();
      const now = new Date().getTime();
      setElapsedTime(Math.floor((now - startTime) / 1000));
      
      setStartTime(existingSession.startTime);
      setAttemptId(existingSession.id);
    } else {
      // Start new session
      const shouldShuffle = mode === 'exam' && (bank.shuffleQuestions === true);
      const order = storageService.generateQuestionOrder(bank.questions.length, shouldShuffle);
      setQuestionOrder(order);

      // Initialize option orders for each question (shuffle if enabled)
      const orders = new Map<number, number[]>();
      if (bank.shuffleOptions) {
        bank.questions.forEach((q, idx) => {
          orders.set(idx, storageService.generateOptionOrder(q.options.length, true));
        });
      }
      setOptionOrders(orders);
    }
  }, [bankId, setLocation, mode]);

  useEffect(() => {
    if (mode === 'exam') {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [mode]);

  // Auto-save session every 5 seconds
  useEffect(() => {
    if (!questionBank) return;
    
    const saveSession = () => {
      const session: ExamSession = {
        id: attemptId,
        questionBankId: questionBank.id,
        questionBankName: questionBank.name,
        mode,
        currentQuestionIndex: currentIndex,
        answers,
        flaggedQuestions: flagged,
        startTime,
        timeLimit: questionBank.timeLimit,
        questionOrder,
        optionOrders,
        hintsUsed: hintsRevealed,
      };
      storageService.saveCurrentSession(session);
    };

    const interval = setInterval(saveSession, 5000);
    
    // Save immediately on changes
    saveSession();
    
    return () => clearInterval(interval);
  }, [questionBank, attemptId, mode, currentIndex, answers, flagged, startTime, questionOrder, optionOrders, hintsRevealed]);

  // Get actual question index (considering shuffling)
  const actualQuestionIndex = questionOrder.length > 0 ? questionOrder[currentIndex] : currentIndex;
  const currentQuestion = questionBank?.questions[actualQuestionIndex];
  const totalQuestions = questionBank?.questions.length || 0;
  const isMultiSelect = currentQuestion ? storageService.isMultiSelect(currentQuestion) : false;

  // Get shuffled options if enabled
  const getShuffledOptions = useCallback(() => {
    if (!currentQuestion) return [];
    const optionOrder = optionOrders.get(actualQuestionIndex);
    if (!optionOrder) return currentQuestion.options;
    return optionOrder.map(idx => currentQuestion.options[idx]);
  }, [currentQuestion, optionOrders, actualQuestionIndex]);

  const shuffledOptions = getShuffledOptions();

  const parseCorrectAnswers = useCallback((correctAnswer: string | string[]): string[] => {
    return storageService.getCorrectAnswersDisplay({ correct_answer: correctAnswer } as any);
  }, []);

  const checkAnswer = useCallback((questionIndex: number, selectedAnswers: string[]): boolean => {
    if (!questionBank) return false;
    const question = questionBank.questions[questionIndex];
    return storageService.checkAnswer(question, selectedAnswers);
  }, [questionBank]);

  const handleSingleSelect = (value: string) => {
    const newAnswers = new Map(answers);
    newAnswers.set(currentIndex, [value]);
    setAnswers(newAnswers);

    if (mode === 'practice' && !practiceAnswered.has(currentIndex)) {
      setPracticeAnswered(new Set([...Array.from(practiceAnswered), currentIndex]));
      setShowFeedback(true);
    }
  };

  const handleMultiSelect = (value: string, checked: boolean) => {
    const currentAnswers = answers.get(currentIndex) || [];
    let newSelected: string[];
    
    if (checked) {
      newSelected = [...currentAnswers, value];
    } else {
      newSelected = currentAnswers.filter(a => a !== value);
    }
    
    const newAnswers = new Map(answers);
    newAnswers.set(currentIndex, newSelected);
    setAnswers(newAnswers);
  };

  const submitMultiSelectAnswer = () => {
    if (mode === 'practice' && !practiceAnswered.has(currentIndex)) {
      setPracticeAnswered(new Set([...Array.from(practiceAnswered), currentIndex]));
      setShowFeedback(true);
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(Array.from(flagged));
    if (newFlagged.has(currentIndex)) {
      newFlagged.delete(currentIndex);
    } else {
      newFlagged.add(currentIndex);
    }
    setFlagged(newFlagged);
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index);
      setShowFeedback(mode === 'practice' && practiceAnswered.has(index));
    }
  };

  const goNext = () => {
    if (currentIndex < totalQuestions - 1) {
      goToQuestion(currentIndex + 1);
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  };

  const revealHint = () => {
    setHintsRevealed(new Set([...Array.from(hintsRevealed), actualQuestionIndex]));
  };

  const submitExam = () => {
    if (!questionBank) return;

    const userAnswers: UserAnswer[] = questionBank.questions.map((question, index) => {
      const selected = answers.get(index) || [];
      const isCorrect = checkAnswer(index, selected);
      const weight = question.weight || 1;
      
      return {
        questionIndex: index,
        selectedOptions: selected,
        isCorrect,
        pointsEarned: isCorrect ? weight : 0,
        pointsPossible: weight,
        section: question.section,
        usedHint: hintsRevealed.has(index),
      };
    });

    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const wrongCount = userAnswers.filter(a => a.selectedOptions.length > 0 && !a.isCorrect).length;
    const skippedCount = userAnswers.filter(a => a.selectedOptions.length === 0).length;
    
    // Calculate weighted score
    const { totalPoints, earnedPoints, score } = storageService.calculateWeightedScore(
      userAnswers,
      questionBank.questions
    );

    // Calculate section scores if sections are defined
    const sectionScores = storageService.calculateSectionScores(
      userAnswers,
      questionBank.questions,
      questionBank.sections
    );

    const passed = questionBank.passingScore ? score >= questionBank.passingScore : undefined;

    const attempt: ExamAttempt = {
      id: attemptId,
      questionBankId: questionBank.id,
      questionBankName: questionBank.name,
      mode,
      startTime,
      endTime: new Date().toISOString(),
      answers: userAnswers,
      totalQuestions,
      correctCount,
      wrongCount,
      skippedCount,
      score,
      totalPoints,
      earnedPoints,
      sectionScores,
      passed,
      completed: true,
    };

    storageService.saveAttempt(attempt);
    storageService.clearCurrentSession(); // Clear session after submit
    setLocation(`/results/${attemptId}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Array.from(answers.values()).filter(a => a.length > 0).length;
  };

  const getOptionClass = (option: string) => {
    if (!showFeedback || !currentQuestion) return "";
    
    const correctAnswers = parseCorrectAnswers(currentQuestion.correct_answer);
    const selectedAnswers = answers.get(currentIndex) || [];
    const isSelected = selectedAnswers.includes(option);
    const isCorrect = correctAnswers.includes(option);

    if (isCorrect) {
      return "border-chart-2 bg-chart-2/10";
    }
    if (isSelected && !isCorrect) {
      return "border-destructive bg-destructive/10";
    }
    return "";
  };

  if (!questionBank || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExitDialogOpen(true)}
                data-testid="button-exit"
              >
                <Home className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-sm md:text-base truncate max-w-[200px] md:max-w-none" data-testid="text-bank-name">
                  {questionBank.name}
                </h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant={mode === 'exam' ? 'default' : 'secondary'} className="text-xs">
                    {mode === 'exam' ? 'Exam Mode' : 'Practice Mode'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {mode === 'exam' && (
                <div className="flex items-center gap-2 text-sm font-mono" data-testid="text-timer">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatTime(elapsedTime)}</span>
                </div>
              )}
              <div className="text-sm text-muted-foreground hidden md:block">
                <span className="font-medium text-foreground">{getAnsweredCount()}</span>/{totalQuestions} answered
              </div>
              <Button onClick={() => setSubmitDialogOpen(true)} data-testid="button-submit">
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{Math.round((getAnsweredCount() / totalQuestions) * 100)}%</span>
            </div>
            <Progress value={(getAnsweredCount() / totalQuestions) * 100} className="h-2" />
          </div>
        </div>
      </header>

      <div className="flex-1 container max-w-6xl mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_250px]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="text-base font-mono px-3 py-1">
                      {currentIndex + 1}
                    </Badge>
                    {isMultiSelect && (
                      <Badge variant="secondary" className="text-xs">
                        Multiple Select
                      </Badge>
                    )}
                    {currentQuestion.section && (
                      <Badge variant="outline" className="text-xs">
                        {currentQuestion.section}
                      </Badge>
                    )}
                    {currentQuestion.weight && currentQuestion.weight !== 1 && (
                      <Badge variant="outline" className="text-xs">
                        {currentQuestion.weight} {currentQuestion.weight === 1 ? 'point' : 'points'}
                      </Badge>
                    )}
                    {currentQuestion.difficulty && (
                      <Badge 
                        variant={
                          currentQuestion.difficulty === 'easy' ? 'secondary' :
                          currentQuestion.difficulty === 'hard' ? 'destructive' : 'default'
                        }
                        className="text-xs"
                      >
                        {currentQuestion.difficulty}
                      </Badge>
                    )}
                    {flagged.has(currentIndex) && (
                      <Flag className="h-4 w-4 text-chart-4 fill-chart-4" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFlag}
                    data-testid="button-flag"
                  >
                    <Flag className={`h-4 w-4 ${flagged.has(currentIndex) ? 'text-chart-4 fill-chart-4' : 'text-muted-foreground'}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg leading-relaxed" data-testid="text-question">
                  {currentQuestion.question}
                </p>

                {/* Hint Section */}
                {currentQuestion.hint && mode === 'practice' && (
                  <div className="space-y-2">
                    {!hintsRevealed.has(actualQuestionIndex) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={revealHint}
                        className="text-xs"
                      >
                        💡 Show Hint
                      </Button>
                    ) : (
                      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="pt-4">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            💡 Hint
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            {currentQuestion.hint}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {isMultiSelect ? (
                    <>
                      {shuffledOptions.map((option, optIndex) => {
                        const isSelected = (answers.get(currentIndex) || []).includes(option);
                        const correctAnswers = parseCorrectAnswers(currentQuestion.correct_answer);
                        const isCorrect = correctAnswers.includes(option);
                        
                        return (
                          <div
                            key={optIndex}
                            className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${getOptionClass(option)} ${!showFeedback && isSelected ? 'border-primary bg-primary/5' : ''}`}
                          >
                            <Checkbox
                              id={`option-${optIndex}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => handleMultiSelect(option, checked as boolean)}
                              disabled={showFeedback}
                              data-testid={`checkbox-option-${optIndex}`}
                            />
                            <Label
                              htmlFor={`option-${optIndex}`}
                              className="flex-1 cursor-pointer text-base leading-relaxed"
                            >
                              {option}
                            </Label>
                            {showFeedback && (
                              isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-chart-2 shrink-0" />
                              ) : isSelected ? (
                                <XCircle className="h-5 w-5 text-destructive shrink-0" />
                              ) : null
                            )}
                          </div>
                        );
                      })}
                      {!showFeedback && mode === 'practice' && (
                        <Button
                          onClick={submitMultiSelectAnswer}
                          disabled={(answers.get(currentIndex) || []).length === 0}
                          className="mt-4"
                          data-testid="button-check-answer"
                        >
                          Check Answer
                        </Button>
                      )}
                    </>
                  ) : (
                    <RadioGroup
                      value={(answers.get(currentIndex) || [])[0] || ''}
                      onValueChange={handleSingleSelect}
                      disabled={showFeedback}
                    >
                      {shuffledOptions.map((option, optIndex) => {
                        const isSelected = (answers.get(currentIndex) || [])[0] === option;
                        const correctAnswers = parseCorrectAnswers(currentQuestion.correct_answer);
                        const isCorrect = correctAnswers.includes(option);
                        
                        return (
                          <div
                            key={optIndex}
                            className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${getOptionClass(option)} ${!showFeedback && isSelected ? 'border-primary bg-primary/5' : ''}`}
                          >
                            <RadioGroupItem
                              value={option}
                              id={`option-${optIndex}`}
                              className="mt-0.5"
                              data-testid={`radio-option-${optIndex}`}
                            />
                            <Label
                              htmlFor={`option-${optIndex}`}
                              className="flex-1 cursor-pointer text-base leading-relaxed"
                            >
                              {option}
                            </Label>
                            {showFeedback && (
                              isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-chart-2 shrink-0" />
                              ) : isSelected ? (
                                <XCircle className="h-5 w-5 text-destructive shrink-0" />
                              ) : null
                            )}
                          </div>
                        );
                      })}
                    </RadioGroup>
                  )}
                </div>

                {showFeedback && currentQuestion.explanation && (
                  <Card className="bg-muted/50 border-0">
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium mb-2">Explanation</p>
                      <p className="text-sm text-muted-foreground" data-testid="text-explanation">
                        {currentQuestion.explanation}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={goPrevious}
                disabled={currentIndex === 0}
                data-testid="button-previous"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} of {totalQuestions}
              </span>
              <Button
                variant="outline"
                onClick={goNext}
                disabled={currentIndex === totalQuestions - 1}
                data-testid="button-next"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <Card className="sticky top-32">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-5 gap-2">
                    {questionBank.questions.map((_, index) => {
                      const isAnswered = (answers.get(index) || []).length > 0;
                      const isFlagged = flagged.has(index);
                      const isCurrent = index === currentIndex;
                      
                      let variant: "default" | "outline" | "secondary" | "destructive" = "outline";
                      if (isCurrent) variant = "default";
                      else if (isAnswered) variant = "secondary";
                      
                      return (
                        <Button
                          key={index}
                          variant={variant}
                          size="sm"
                          className={`w-full h-9 text-xs font-mono relative ${isFlagged ? 'ring-2 ring-chart-4 ring-offset-1' : ''}`}
                          onClick={() => goToQuestion(index)}
                          data-testid={`button-nav-${index}`}
                        >
                          {index + 1}
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className="mt-4 pt-4 border-t space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-secondary" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border" />
                    <span>Not answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border ring-2 ring-chart-4 ring-offset-1" />
                    <span>Flagged</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-chart-4" />
              Submit {mode === 'exam' ? 'Exam' : 'Practice'}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>You have answered {getAnsweredCount()} out of {totalQuestions} questions.</p>
                {getAnsweredCount() < totalQuestions && (
                  <p className="text-chart-4">
                    {totalQuestions - getAnsweredCount()} questions are unanswered.
                  </p>
                )}
                <p>Are you sure you want to submit?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-submit">Continue {mode === 'exam' ? 'Exam' : 'Practice'}</AlertDialogCancel>
            <AlertDialogAction onClick={submitExam} data-testid="button-confirm-submit">
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit {mode === 'exam' ? 'Exam' : 'Practice'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be lost. Are you sure you want to exit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-exit">Stay</AlertDialogCancel>
            <AlertDialogAction onClick={() => setLocation('/')} data-testid="button-confirm-exit">
              Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
