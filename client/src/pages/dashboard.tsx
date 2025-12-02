import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Upload,
  Play,
  BookOpen,
  Trash2,
  Clock,
  Target,
  TrendingUp,
  FileQuestion,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  History,
  Code,
  RotateCcw,
} from "lucide-react";
import { storageService } from "@/lib/storage";
import { loadSampleQuestionBanks } from "@/data/sample-questions";
import type { QuestionBank, UserStats, ExamAttempt } from "@/lib/types";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<ExamAttempt[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<QuestionBank | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [resumableSession, setResumableSession] = useState<any>(null);

  useEffect(() => {
    const initializeData = async () => {
      await loadSampleQuestionBanks();
      refreshData();
      
      // Check for resumable session
      const session = storageService.getCurrentSession();
      if (session) {
        setResumableSession(session);
      }
    };
    initializeData();
  }, []);

  const refreshData = () => {
    setQuestionBanks(storageService.getQuestionBanks());
    setUserStats(storageService.getUserStats());
    setRecentAttempts(storageService.getAttempts().slice(0, 5));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      let questions = [];
      
      if (Array.isArray(data)) {
        questions = data;
      } else if (data.questions && Array.isArray(data.questions)) {
        questions = data.questions;
      } else if (data.question) {
        questions = [data];
      } else {
        throw new Error("Invalid format: Expected an array of questions or an object with a 'questions' array");
      }

      for (const q of questions) {
        if (!q.question || !q.options || !q.correct_answer) {
          throw new Error("Each question must have 'question', 'options', and 'correct_answer' fields");
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          throw new Error("Each question must have at least 2 options");
        }
      }

      const bankName = file.name.replace(/\.json$/i, '').replace(/[-_]/g, ' ');
      
      const newBank: QuestionBank = {
        id: storageService.generateId(),
        name: bankName,
        description: `Uploaded from ${file.name}`,
        questions,
        dateAdded: new Date().toISOString(),
      };

      storageService.saveQuestionBank(newBank);
      refreshData();
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to parse JSON file");
    }
  };

  const handleDeleteBank = (bank: QuestionBank) => {
    setBankToDelete(bank);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (bankToDelete) {
      storageService.deleteQuestionBank(bankToDelete.id);
      refreshData();
    }
    setDeleteDialogOpen(false);
    setBankToDelete(null);
  };

  const startExam = (bankId: string, mode: 'exam' | 'practice') => {
    setLocation(`/${mode}/${bankId}`);
  };

  const getBestScore = (bankId: string): number | null => {
    const attempts = storageService.getAttemptsByBankId(bankId).filter(a => a.completed);
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map(a => a.score));
  };

  const getLastAttemptDate = (bankId: string): string | null => {
    const attempts = storageService.getAttemptsByBankId(bankId).filter(a => a.completed);
    if (attempts.length === 0) return null;
    return attempts[0].endTime || null;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
            Exam Practice Portal
          </h1>
          <p className="text-muted-foreground">
            Master your certification exams with practice tests and instant feedback
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-attempts">{userStats?.totalAttempts || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-2/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-correct">{userStats?.totalCorrect || 0}</p>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-4/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-average-score">{userStats?.averageScore || 0}%</p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-3/10 rounded-lg">
                  <FileQuestion className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-questions">{userStats?.totalQuestionsAnswered || 0}</p>
                  <p className="text-sm text-muted-foreground">Questions Answered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Resume Session Banner */}
            {resumableSession && (
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <RotateCcw className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          Resume {resumableSession.mode === 'exam' ? 'Exam' : 'Practice'}
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {resumableSession.questionBankName} • Question {resumableSession.currentQuestionIndex + 1}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          storageService.clearCurrentSession();
                          setResumableSession(null);
                        }}
                      >
                        Discard
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setLocation(`/${resumableSession.mode}/${resumableSession.questionBankId}`)}
                      >
                        Resume
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Section - Collapsible */}
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => setShowUpload(!showUpload)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    <CardTitle className="text-base">Upload Question Bank</CardTitle>
                  </div>
                  {showUpload ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
              {showUpload && (
                <CardContent>
                  <div 
                    className="border-2 border-dashed rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center justify-center text-center gap-3">
                      <div className="p-4 bg-muted rounded-full">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          JSON files only
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileUpload}
                        data-testid="input-file-upload"
                      />
                    </div>
                  </div>
                  {uploadError && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive" data-testid="text-upload-error">{uploadError}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            <div>
              <h2 className="text-xl font-semibold mb-4">Question Banks</h2>
              {questionBanks.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No question banks available</p>
                    <p className="text-sm text-muted-foreground mt-1">Upload a JSON file to get started</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {questionBanks.map((bank) => {
                    const bestScore = getBestScore(bank.id);
                    const lastAttempt = getLastAttemptDate(bank.id);
                    
                    return (
                      <Card key={bank.id} className="hover-elevate" data-testid={`card-bank-${bank.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg truncate" data-testid={`text-bank-name-${bank.id}`}>
                                {bank.name}
                              </CardTitle>
                              {bank.description && (
                                <CardDescription className="mt-1 line-clamp-2">
                                  {bank.description}
                                </CardDescription>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBank(bank);
                              }}
                              data-testid={`button-delete-${bank.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                              {bank.questions.length} questions
                            </Badge>
                            {bestScore !== null && (
                              <Badge variant={bestScore >= 70 ? "default" : "outline"}>
                                Best: {bestScore}%
                              </Badge>
                            )}
                          </div>

                          {bestScore !== null && (
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Best Score</span>
                                <span className="font-medium">{bestScore}%</span>
                              </div>
                              <Progress value={bestScore} className="h-2" />
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Last attempt: {formatDate(lastAttempt)}</span>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              className="flex-1"
                              onClick={() => startExam(bank.id, 'exam')}
                              data-testid={`button-exam-${bank.id}`}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Exam Mode
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => startExam(bank.id, 'practice')}
                              data-testid={`button-practice-${bank.id}`}
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              Practice
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Recent Attempts - Collapsible */}
            <Card>
              <CardHeader className="cursor-pointer pb-3" onClick={() => setShowHistory(!showHistory)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    <CardTitle className="text-base">Recent Attempts</CardTitle>
                  </div>
                  {showHistory ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
              {showHistory && (
                <CardContent>
                  {recentAttempts.length === 0 ? (
                    <div className="py-8 text-center">
                      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No attempts yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Start a practice test to see your history</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentAttempts.map((attempt) => (
                        <Card
                          key={attempt.id}
                          className="hover-elevate cursor-pointer"
                          onClick={() => setLocation(`/results/${attempt.id}`)}
                          data-testid={`card-attempt-${attempt.id}`}
                        >
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-sm truncate flex-1 mr-2">
                                {attempt.questionBankName}
                              </p>
                              <Badge variant={attempt.mode === 'exam' ? 'default' : 'secondary'} className="shrink-0">
                                {attempt.mode}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className={`font-semibold ${attempt.score >= 70 ? 'text-chart-2' : 'text-destructive'}`}>
                                {attempt.score}%
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {formatDate(attempt.endTime)}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {attempt.correctCount}/{attempt.totalQuestions} correct
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {recentAttempts.length >= 5 && (
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => setLocation('/history')}
                          data-testid="button-view-all-history"
                        >
                          View All History
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* JSON Format Guide - Collapsible */}
            <Card>
              <CardHeader className="cursor-pointer pb-3" onClick={() => setShowFormatGuide(!showFormatGuide)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    <CardTitle className="text-base">JSON Format Guide</CardTitle>
                  </div>
                  {showFormatGuide ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
              {showFormatGuide && (
                <CardContent className="text-sm text-muted-foreground space-y-3">
                  <p>Upload a JSON file with this structure:</p>
                  <pre className="bg-background p-3 rounded-lg text-xs overflow-x-auto">
{`[
  {
    "question": "Your question?",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A",
    "explanation": "Optional"
  }
]`}
                </pre>
                  <p className="text-xs">
                    For multi-select, include multiple answers separated by commas in correct_answer.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('/bank/README.md', '_blank');
                    }}
                  >
                    View Full Documentation
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question Bank</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{bankToDelete?.name}"? This action cannot be undone
              and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
