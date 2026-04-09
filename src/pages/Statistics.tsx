import { useNavigate } from "react-router-dom";
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Trophy, Target, Clock, TrendingUp, Star, Flame } from 'lucide-react';
import type { Deck, Flashcard, StudySession } from "../types";
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function Statistics() {
  const navigate = useNavigate();
  const [decks] = useLocalStorage<Deck[]>('flashcard-decks', []);
  const [flashcards] = useLocalStorage<Flashcard[]>('flashcards', []);
  const [sessions] = useLocalStorage<StudySession[]>('study-sessions', []);

  const totalCards = flashcards.length;
  const totalMinutesStudied = Math.floor(
    sessions.reduce((acc, s) => acc + s.duration, 0) / 60,
  );
  
  const correctAnswers = sessions.reduce((acc, s) => acc + s.correctAnswers, 0);
  const incorrectAnswers = sessions.reduce((acc, s) => acc + s.incorrectAnswers, 0);
  const totalAnswers = correctAnswers + incorrectAnswers;
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  const mostStudiedCards = flashcards
    .filter(c => c.timesStudied && c.timesStudied > 0)
    .sort((a, b) => (b.timesStudied || 0) - (a.timesStudied || 0))
    .slice(0, 5);

  // Deck performance data
  const deckStats = decks.map(deck => {
    const deckCards = flashcards.filter(c => c.deckId === deck.id);
    const deckSessions = sessions.filter(s => s.deckId === deck.id);
    const correct = deckSessions.reduce((acc, s) => acc + s.correctAnswers, 0);
    const total = deckSessions.reduce((acc, s) => acc + s.correctAnswers + s.incorrectAnswers, 0);
    
    return {
      name: deck.name,
      cards: deckCards.length,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      color: deck.color,
    };
  }).sort((a, b) => b.accuracy - a.accuracy);

  // Recent activity (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  });

  const activityData = last7Days.map(timestamp => {
    const dayStart = timestamp;
    const dayEnd = timestamp + 24 * 60 * 60 * 1000;
    const daySessions = sessions.filter(s => s.date >= dayStart && s.date < dayEnd);
    const cardsStudied = daySessions.reduce((acc, s) => acc + s.cardsStudied, 0);
    
    const date = new Date(timestamp);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      cards: cardsStudied,
    };
  });

  // Difficulty distribution
  const difficultyData = [
    { name: 'Easy', value: flashcards.filter(c => c.difficulty === 'easy').length, color: '#10b981' },
    { name: 'Medium', value: flashcards.filter(c => c.difficulty === 'medium').length, color: '#f59e0b' },
    { name: 'Hard', value: flashcards.filter(c => c.difficulty === 'hard').length, color: '#ef4444' },
    { name: 'Unrated', value: flashcards.filter(c => !c.difficulty).length, color: '#6b7280' },
  ].filter(d => d.value > 0);

  const currentStreak = calculateStreak(sessions);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Statistics</h1>
              <p className="text-muted-foreground">Track your learning progress</p>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalCards}</div>
                <div className="text-sm text-muted-foreground">Total Cards</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{accuracy}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalMinutesStudied}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{currentStreak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Activity Chart */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Last 7 Days Activity
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cards" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Difficulty Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Card Difficulty</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Deck Performance */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4">Deck Performance</h3>
          {deckStats.length > 0 ? (
            <div className="space-y-3">
              {deckStats.map((deck, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: deck.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{deck.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {deck.accuracy}% • {deck.cards} cards
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all"
                        style={{ 
                          width: `${deck.accuracy}%`,
                          backgroundColor: deck.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No study data yet. Start studying to see your performance!
            </p>
          )}
        </Card>

        {/* Most Studied Cards */}
        {mostStudiedCards.length > 0 && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Most Studied Cards
            </h3>
            <div className="space-y-3">
              {mostStudiedCards.map((card, index) => (
                <div key={card.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium mb-1">{card.question}</div>
                    <div className="text-sm text-muted-foreground">
                      Studied {card.timesStudied} times • 
                      {card.correctCount && card.correctCount > 0 && (
                        <span> {Math.round((card.correctCount / (card.timesStudied || 1)) * 100)}% correct</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function calculateStreak(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = today.getTime();
  
  while (true) {
    const dayStart = currentDate;
    const dayEnd = currentDate + 24 * 60 * 60 * 1000;
    const hasStudied = sessions.some(s => s.date >= dayStart && s.date < dayEnd);
    
    if (hasStudied) {
      streak++;
      currentDate -= 24 * 60 * 60 * 1000; // Go back one day
    } else if (streak === 0 && currentDate === today.getTime()) {
      // Today hasn't been studied yet, check yesterday
      currentDate -= 24 * 60 * 60 * 1000;
    } else {
      break;
    }
  }
  
  return streak;
}
