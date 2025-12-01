import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Eye,
  CheckCircle2,
  XCircle,
  MinusCircle,
  TrendingUp,
  Calendar,
  Filter,
} from "lucide-react";
import { storageService } from "@/lib/storage";
import type { ExamAttempt, QuestionBank } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function HistoryPage() {
  const [, setLocation] = useLocation();
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [filterBank, setFilterBank] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<string>('all');

  useEffect(() => {
    setAttempts(storageService.getAttempts());
    setQuestionBanks(storageService.getQuestionBanks());
  }, []);

  const filteredAttempts = attempts.filter(attempt => {
    if (filterBank !== 'all' && attempt.questionBankId !== filterBank) return false;
    if (filterMode !== 'all' && attempt.mode !== filterMode) return false;
    return attempt.completed;
  });

  const recentAttempts = filteredAttempts.slice(0, 10);
  
  const chartData = recentAttempts
    .slice()
    .reverse()
    .map((attempt, index) => ({
      name: `#${recentAttempts.length - index}`,
      score: attempt.score,
      bankName: attempt.questionBankName,
      date: new Date(attempt.endTime || attempt.startTime).toLocaleDateString(),
    }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-chart-2';
    if (score >= 60) return 'text-chart-4';
    return 'text-destructive';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--chart-2))';
    if (score >= 60) return 'hsl(var(--chart-4))';
    return 'hsl(var(--destructive))';
  };

  const averageScore = filteredAttempts.length > 0
    ? Math.round(filteredAttempts.reduce((sum, a) => sum + a.score, 0) / filteredAttempts.length)
    : 0;

  const bestScore = filteredAttempts.length > 0
    ? Math.max(...filteredAttempts.map(a => a.score))
    : 0;

  const totalCorrect = filteredAttempts.reduce((sum, a) => sum + a.correctCount, 0);
  const totalQuestions = filteredAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
              Attempt History
            </h1>
            <p className="text-muted-foreground mt-1">
              Review your past attempts and track your progress
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation('/')} data-testid="button-home">
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-total-attempts">
                    {filteredAttempts.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-2/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-average-score">
                    {averageScore}%
                  </p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-4/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-best-score">
                    {bestScore}%
                  </p>
                  <p className="text-sm text-muted-foreground">Best Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-3/10 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid="text-accuracy">
                    {totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {chartData.length > 1 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Score Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Score']}
                      labelFormatter={(_, payload) => {
                        if (payload && payload[0]) {
                          const data = payload[0].payload;
                          return `${data.bankName} - ${data.date}`;
                        }
                        return '';
                      }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg">All Attempts</CardTitle>
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterBank} onValueChange={setFilterBank}>
                  <SelectTrigger className="w-[180px]" data-testid="select-filter-bank">
                    <SelectValue placeholder="Filter by bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Question Banks</SelectItem>
                    {questionBanks.map(bank => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterMode} onValueChange={setFilterMode}>
                  <SelectTrigger className="w-[130px]" data-testid="select-filter-mode">
                    <SelectValue placeholder="Filter by mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="practice">Practice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAttempts.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No attempts found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {attempts.length > 0 ? 'Try adjusting your filters' : 'Start a practice test to build your history'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question Bank</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="hidden md:table-cell">Results</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttempts.map((attempt) => (
                      <TableRow key={attempt.id} data-testid={`row-attempt-${attempt.id}`}>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {attempt.questionBankName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={attempt.mode === 'exam' ? 'default' : 'secondary'}>
                            {attempt.mode}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${getScoreColor(attempt.score)}`}>
                            {attempt.score}%
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-chart-2">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {attempt.correctCount}
                            </span>
                            <span className="flex items-center gap-1 text-destructive">
                              <XCircle className="h-3.5 w-3.5" />
                              {attempt.wrongCount}
                            </span>
                            {attempt.skippedCount > 0 && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <MinusCircle className="h-3.5 w-3.5" />
                                {attempt.skippedCount}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          <div>
                            <div>{formatDate(attempt.endTime || attempt.startTime)}</div>
                            <div className="text-xs">{formatTime(attempt.endTime || attempt.startTime)}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/results/${attempt.id}`)}
                            data-testid={`button-view-${attempt.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
