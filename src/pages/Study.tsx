import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { Button } from '../components/ui/button';
import { FlashcardDisplay } from '../components/FlashcardDisplay';
import { QuizMode } from '../components/QuizMode';
import { ArrowLeft, Shuffle, ChevronLeft, ChevronRight, Check, Brain, CreditCard, Clock } from 'lucide-react';
import { Deck, Flashcard, StudySession } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card } from '../components/ui/card';

export function Study() {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const [decks] = useLocalStorage<Deck[]>('flashcard-decks', []);
  const [flashcards] = useLocalStorage<Flashcard[]>('flashcards', []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [studySession, setStudySession] = useLocalStorage<StudySession>('study-session', { deckId: '', startTime: 0, endTime: 0, cardsStudied: 0, correctAnswers: 0 });

  const deck = decks.find(d => d.id === deckId);
  const deckCards = flashcards.filter(card => card.deckId === deckId);

  useEffect(() => {
    if (deckCards.length > 0) {
      setStudyCards(deckCards);
    }
  }, [deckId]);

  const handleShuffle = () => {
    const shuffled = [...deckCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setIsComplete(false);
  };

  const handleNext = () => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
    setIsComplete(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsComplete(false);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{deck.name}</h1>
              <p className="text-sm text-muted-foreground">
                {studyCards.length} cards
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleShuffle}>
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle
          </Button>
        </div>

        {!isComplete ? (
          <>
            <div className="mb-6">
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex flex-col items-center gap-8">
              <FlashcardDisplay
                question={studyCards[currentIndex].question}
                answer={studyCards[currentIndex].answer}
                cardNumber={currentIndex + 1}
                totalCards={studyCards.length}
              />

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={handleNext}>
                  {currentIndex === studyCards.length - 1 ? 'Finish' : 'Next'}
                  {currentIndex !== studyCards.length - 1 && (
                    <ChevronRight className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Great Job!</h2>
            <p className="text-muted-foreground mb-8">
              You've completed all {studyCards.length} cards in this deck
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Decks
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