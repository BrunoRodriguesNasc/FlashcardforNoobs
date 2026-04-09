import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from '../components/ui/button';
import { FlashcardDisplay } from '../components/FlashcardDisplay';
import { QuizMode } from '../components/QuizMode';
import { ArrowLeft, Shuffle, Brain, CreditCard, Clock, Trophy } from "lucide-react";
import type { Deck, Flashcard, StudySession } from "../types";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card } from '../components/ui/card';

export function StudyEnhanced() {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const [decks] = useLocalStorage<Deck[]>('flashcard-decks', []);
  const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>('flashcards', []);
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [studyMode, setStudyMode] = useState<'flashcard' | 'quiz'>('flashcard');
  const sessionStartRef = useRef(Date.now());
  /** Bump when “Study again” resets the session clock. */
  const [sessionEpoch, setSessionEpoch] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const deck = decks.find(d => d.id === deckId);
  const deckCards = flashcards.filter(card => card.deckId === deckId);

  useEffect(() => {
    sessionStartRef.current = Date.now();
    setElapsedTime(0);
  }, [sessionEpoch]);

  useEffect(() => {
    if (deckCards.length > 0) {
      setStudyCards(deckCards);
    }
  }, [deckId, deckCards]);

  useEffect(() => {
    if (isComplete) return undefined;
    const tick = () => {
      setElapsedTime(
        Math.floor((Date.now() - sessionStartRef.current) / 1000),
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isComplete, sessionEpoch]);

  const handleShuffle = () => {
    const shuffled = [...deckCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setIsComplete(false);
  };

  const handleQuizAnswer = (correct: boolean) => {
    const card = studyCards[currentIndex];
    
    // Update card stats
    setFlashcards(flashcards.map(c => 
      c.id === card.id 
        ? {
            ...c,
            timesStudied: (c.timesStudied || 0) + 1,
            correctCount: (c.correctCount || 0) + (correct ? 1 : 0),
            incorrectCount: (c.incorrectCount || 0) + (correct ? 0 : 1),
          }
        : c
    ));

    if (correct) {
      setCorrectCount(correctCount + 1);
    } else {
      setIncorrectCount(incorrectCount + 1);
    }

    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishSession();
    }
  };

  const handleFlashcardNext = () => {
    const card = studyCards[currentIndex];
    
    // Update card stats
    setFlashcards(flashcards.map(c => 
      c.id === card.id 
        ? { ...c, timesStudied: (c.timesStudied || 0) + 1 }
        : c
    ));

    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    const finalSeconds = Math.floor(
      (Date.now() - sessionStartRef.current) / 1000,
    );
    setElapsedTime(finalSeconds);
    const session: StudySession = {
      id: crypto.randomUUID(),
      deckId: deckId!,
      cardsStudied: studyCards.length,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      duration: finalSeconds * 1000,
      date: Date.now(),
      studyMode,
    };
    setSessions((prev) => [...prev, session]);
    setIsComplete(true);
  };

  const handleRestart = () => {
    setSessionEpoch((e) => e + 1);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!deck) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Deck not found</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (studyCards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            This deck has no cards yet
          </p>
          <Button onClick={() => navigate('/cards')}>Add Cards</Button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / studyCards.length) * 100;
  const accuracy = correctCount + incorrectCount > 0 
    ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: deck.color }}
            >
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{deck.name}</h1>
              <p className="text-sm text-muted-foreground">
                {studyCards.length} cards
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Card className="px-4 py-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
            </Card>
            <Button variant="outline" onClick={handleShuffle}>
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
          </div>
        </div>

        {!isComplete ? (
          <>
            <Tabs value={studyMode} onValueChange={(v) => setStudyMode(v as 'flashcard' | 'quiz')} className="mb-6">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="flashcard">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Flashcards
                </TabsTrigger>
                <TabsTrigger value="quiz">
                  <Brain className="w-4 h-4 mr-2" />
                  Quiz Mode
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                <span>Progress</span>
                <span>
                  {currentIndex + 1} / {studyCards.length}
                  {studyMode === 'quiz' && ` • ${accuracy}% accuracy`}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex flex-col items-center">
              {studyMode === 'flashcard' ? (
                <>
                  <FlashcardDisplay
                    question={studyCards[currentIndex].question}
                    answer={studyCards[currentIndex].answer}
                    cardNumber={currentIndex + 1}
                    totalCards={studyCards.length}
                  />
                  <div className="mt-8 flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                      disabled={currentIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button onClick={handleFlashcardNext}>
                      {currentIndex === studyCards.length - 1 ? 'Finish' : 'Next Card'}
                    </Button>
                  </div>
                </>
              ) : (
                <QuizMode
                  card={studyCards[currentIndex]}
                  allAnswers={studyCards.map(c => c.answer)}
                  onAnswer={handleQuizAnswer}
                  cardNumber={currentIndex + 1}
                  totalCards={studyCards.length}
                />
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Session Complete! 🎉</h2>
            <p className="text-muted-foreground mb-8">
              You've completed all {studyCards.length} cards in {formatTime(elapsedTime)}
            </p>
            
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
              <Card className="p-4">
                <div className="text-2xl font-bold">{studyCards.length}</div>
                <div className="text-sm text-muted-foreground">Cards Studied</div>
              </Card>
              {studyMode === 'quiz' && (
                <>
                  <Card className="p-4">
                    <div className="text-2xl font-bold text-green-600">{correctCount}</div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{accuracy}%</div>
                    <div className="text-sm text-muted-foreground">Accuracy</div>
                  </Card>
                </>
              )}
              {studyMode === 'flashcard' && (
                <Card className="p-4 col-span-2">
                  <div className="text-2xl font-bold">{formatTime(elapsedTime)}</div>
                  <div className="text-sm text-muted-foreground">Time Spent</div>
                </Card>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Decks
              </Button>
              <Button onClick={() => navigate('/statistics')}>
                View Statistics
              </Button>
              <Button onClick={handleRestart}>
                Study Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
