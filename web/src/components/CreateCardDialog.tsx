import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Deck, Flashcard } from "../types";
import { Star } from 'lucide-react';

interface CreateCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decks: Deck[];
  onCreateCard: (question: string, answer: string, deckId: string, isFavorite: boolean, difficulty?: 'easy' | 'medium' | 'hard') => void;
  editingCard?: Flashcard | null;
  onUpdateCard?: (id: string, question: string, answer: string, deckId: string, isFavorite: boolean, difficulty?: 'easy' | 'medium' | 'hard') => void;
}

export function CreateCardDialog({ 
  open, 
  onOpenChange, 
  decks,
  onCreateCard,
  editingCard,
  onUpdateCard
}: CreateCardDialogProps) {
  const [question, setQuestion] = useState(editingCard?.question || '');
  const [answer, setAnswer] = useState(editingCard?.answer || '');
  const [selectedDeckId, setSelectedDeckId] = useState(editingCard?.deckId || decks[0]?.id || '');
  const [isFavorite, setIsFavorite] = useState(editingCard?.isFavorite || false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | undefined>(editingCard?.difficulty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && answer.trim() && selectedDeckId) {
      if (editingCard && onUpdateCard) {
        onUpdateCard(editingCard.id, question, answer, selectedDeckId, isFavorite, difficulty);
      } else {
        onCreateCard(question, answer, selectedDeckId, isFavorite, difficulty);
      }
      setQuestion('');
      setAnswer('');
      setIsFavorite(false);
      setDifficulty(undefined);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deck-select">Deck</Label>
                <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
                  <SelectTrigger id="deck-select">
                    <SelectValue placeholder="Select a deck" />
                  </SelectTrigger>
                  <SelectContent>
                    {decks.map((deck) => (
                      <SelectItem key={deck.id} value={deck.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded" 
                            style={{ backgroundColor: deck.color }}
                          />
                          {deck.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficulty-select">Difficulty</Label>
                <Select value={difficulty || 'none'} onValueChange={(v) => setDifficulty(v === 'none' ? undefined : v as 'easy' | 'medium' | 'hard')}>
                  <SelectTrigger id="difficulty-select">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not set</SelectItem>
                    <SelectItem value="easy">
                      <span className="text-green-600">● Easy</span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="text-yellow-600">● Medium</span>
                    </SelectItem>
                    <SelectItem value="hard">
                      <span className="text-red-600">● Hard</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter the question"
                rows={3}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter the answer"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={isFavorite ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Star className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!question.trim() || !answer.trim() || !selectedDeckId}
            >
              {editingCard ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}