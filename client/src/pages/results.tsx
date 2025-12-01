import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Home,
  RotateCcw,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Trophy,
  Target,
  Clock,
  ArrowRight,
} from "lucide-react";
import { storageService } from "@/lib/storage";
import type { ExamAttempt, QuestionBank } from "@/lib/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [, setLocation] = useLocation();
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);

  useEffect(() => {
    if (!attemptId) {
      setLocation('/');
      return;
    }
    const foundAttempt = storageService.getAttemptById(attemptId);
    if (!foundAttempt) {
      setLocation('/');
      return;
    }
    setAttempt(foundAttempt);
    
    const bank = storageService.getQuestionBankById(foundAttempt.questionBankId);
    setQuestionBank(bank || null);
  }, [attemptId, setLocation]);

  if (!attempt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Correct', value: attempt.correctCount, color: 'hsl(var(--chart-2))' },
    { name: 'Wrong', value: attempt.wrongCount, color: 'hsl(var(--destructive))' },
    { name: 'Skipped', value: attempt.skippedCount, color: 'hsl(var(--muted))' },
  ].filter(d => d.value > 0);

  const formatDuration = () => {
    if (!attempt.startTime || !attempt.endTime) return 'N/A';
    const start = new Date(attempt.startTime);
    const end = new Date(attempt.endTime);
    const diffMs = end.getTime() - start.getTime();
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = () => {
    if (attempt.score >= 80) return 'text-chart-2';
    if (attempt.score >= 60) return 'text-chart-4';
    return 'text-destructive';
  };

  const getScoreMessage = () => {
    if (attempt.score >= 90) return { icon: Trophy, message: 'Excellent! Outstanding performance!' };
    if (attempt.score >= 80) return { icon: Trophy, message: 'Great job! You passed with flying colors!' };
    if (attempt.score >= 70) return { icon: CheckCircle2, message: 'Good work! You passed!' };
    if (attempt.score >= 60) return { icon: Target, message: 'Close! A bit more practice and you\'ll pass!' };
    return { icon: Target, message: 'Keep practicing! You\'re making progress.' };
  };

  const scoreInfo = getScoreMessage();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-results-title">
              Results
            </h1>
            <p className="text-muted-foreground mt-1" data-testid="text-bank-name">
              {attempt.questionBankName}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation('/')} data-testid="button-home">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button onClick={() => setLocation(`/${attempt.mode}/${attempt.questionBankId}`)} data-testid="button-retry">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                <scoreInfo.icon className={`h-8 w-8 ${getScoreColor()}`} />
              </div>
              <div className={`text-6xl font-bold ${getScoreColor()} mb-2`} data-testid="text-score">
                {attempt.score}%
              </div>
              <p className="text-muted-foreground" data-testid="text-score-message">
                {scoreInfo.message}
              </p>
              <Badge variant={attempt.mode === 'exam' ? 'default' : 'secondary'} className="mt-3">
                {attempt.mode === 'exam' ? 'Exam Mode' : 'Practice Mode'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-chart-2" />
                  <span className="text-2xl font-bold text-chart-2" data-testid="text-correct-count">
                    {attempt.correctCount}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-2xl font-bold text-destructive" data-testid="text-wrong-count">
                    {attempt.wrongCount}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Wrong</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <MinusCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold" data-testid="text-skipped-count">
                    {attempt.skippedCount}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Skipped</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold" data-testid="text-duration">
                    {formatDuration()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="h-[200px] mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} questions`, '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              Completed on {formatDate(attempt.endTime || attempt.startTime)}
            </div>
          </CardContent>
        </Card>

        {/* Section Scores */}
        {attempt.sectionScores && attempt.sectionScores.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Performance by Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attempt.sectionScores.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{section.section}</p>
                      <p className="text-sm text-muted-foreground">
                        Weight: {section.weight}% of total score
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        section.score >= 80 ? 'text-chart-2' :
                        section.score >= 60 ? 'text-chart-4' :
                        'text-destructive'
                      }`}>
                        {section.score}%
                      </p>
                    </div>
                  </div>
                  <Progress value={section.score} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Weighted Score Info */}
        {attempt.totalPoints && attempt.totalPoints > attempt.totalQuestions && (
          <Card className="mb-8 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Weighted Scoring
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                    Questions have different point values based on difficulty
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {attempt.earnedPoints}/{attempt.totalPoints}
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    points earned
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pass/Fail Status */}
        {attempt.passed !== undefined && questionBank?.passingScore && (
          <Card className={`mb-8 ${
            attempt.passed 
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {attempt.passed ? (
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <p className={`text-2xl font-bold ${
                    attempt.passed 
                      ? 'text-green-900 dark:text-green-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {attempt.passed ? 'Passed!' : 'Not Passed'}
                  </p>
                  <p className={`text-sm ${
                    attempt.passed 
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    Passing score: {questionBank.passingScore}% • Your score: {attempt.score}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {questionBank && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Review</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {attempt.answers.map((answer, index) => {
                  const question = questionBank.questions[index];
                  if (!question) return null;
                  
                  const correctAnswers = storageService.getCorrectAnswersDisplay(question);
                  
                  return (
                    <AccordionItem key={index} value={`question-${index}`} data-testid={`accordion-question-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          {answer.isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-chart-2 shrink-0" />
                          ) : answer.selectedOptions.length === 0 ? (
                            <MinusCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive shrink-0" />
                          )}
                          <span className="font-mono text-sm text-muted-foreground shrink-0">
                            Q{index + 1}
                          </span>
                          <span className="line-clamp-1 text-sm">
                            {question.question}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-4 pl-8">
                          <p className="text-sm leading-relaxed">
                            {question.question}
                          </p>
                          
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => {
                              const isCorrect = correctAnswers.includes(option);
                              const isSelected = answer.selectedOptions.includes(option);
                              
                              let bgClass = '';
                              if (isCorrect) bgClass = 'bg-chart-2/10 border-chart-2';
                              else if (isSelected) bgClass = 'bg-destructive/10 border-destructive';
                              
                              return (
                                <div
                                  key={optIndex}
                                  className={`flex items-start gap-3 p-3 rounded-lg border ${bgClass}`}
                                >
                                  <div className="mt-0.5">
                                    {isCorrect ? (
                                      <CheckCircle2 className="h-4 w-4 text-chart-2" />
                                    ) : isSelected ? (
                                      <XCircle className="h-4 w-4 text-destructive" />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full border" />
                                    )}
                                  </div>
                                  <span className="text-sm">{option}</span>
                                </div>
                              );
                            })}
                          </div>

                          {answer.selectedOptions.length === 0 && (
                            <div className="text-sm text-muted-foreground italic">
                              Question was skipped
                            </div>
                          )}

                          {!answer.isCorrect && answer.selectedOptions.length > 0 && (
                            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                              <ArrowRight className="h-4 w-4 text-chart-2 mt-0.5 shrink-0" />
                              <div className="text-sm">
                                <span className="font-medium">Correct answer: </span>
                                <span className="text-muted-foreground">
                                  {correctAnswers.join(', ')}
                                </span>
                              </div>
                            </div>
                          )}

                          {question.explanation && (
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm font-medium mb-1">Explanation</p>
                              <p className="text-sm text-muted-foreground">
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
