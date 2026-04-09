import type { Deck } from "../types";
import { Card } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, Trash2, Edit2, Sparkles } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  cardCount: number;
  onStudy: (deckId: string) => void;
  onEdit: (deck: Deck) => void;
  onDelete: (deckId: string) => void;
}

export function DeckCard({ deck, cardCount, onStudy, onEdit, onDelete }: DeckCardProps) {
  return (
    <Card className="p-6 hover:shadow-xl transition-all hover:-translate-y-1 border-2 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div 
        className="absolute top-0 left-0 right-0 h-2"
        style={{ 
          background: `linear-gradient(90deg, ${deck.color}, ${deck.color}dd)`,
        }}
      />
      
      <div className="flex items-start justify-between mb-4 mt-2">
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg relative"
            style={{ 
              background: `linear-gradient(135deg, ${deck.color}, ${deck.color}cc)`,
            }}
          >
            <BookOpen className="w-7 h-7 text-white" />
            {cardCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold shadow" style={{ color: deck.color }}>
                {cardCount > 99 ? '99+' : cardCount}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{deck.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{cardCount} {cardCount === 1 ? 'card' : 'cards'}</span>
              {cardCount > 0 && (
                <>
                  <span>•</span>
                  <Sparkles className="w-3 h-3" />
                  <span>Ready to study</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(deck)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(deck.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <Button 
        className="w-full" 
        onClick={() => onStudy(deck.id)}
        disabled={cardCount === 0}
        style={{
          backgroundColor: cardCount > 0 ? deck.color : undefined,
        }}
      >
        {cardCount === 0 ? 'Add Cards to Study' : 'Start Studying'}
      </Button>
    </Card>
  );
}