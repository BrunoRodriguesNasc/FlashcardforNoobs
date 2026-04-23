import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from '../components/ui/button';
import { DeckCard } from '../components/DeckCard';
import { CreateDeckDialog } from '../components/CreateDeckDialog';
import { Plus, Library, BarChart3 } from 'lucide-react';
import type { Deck, Flashcard } from "../types";
import { useLocalStorage } from '../hooks/useLocalStorage';

export function Home() {
  const navigate = useNavigate();
  const [decks, setDecks] = useLocalStorage<Deck[]>('flashcard-decks', []);
  const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>('flashcards', []);
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);

  const handleCreateDeck = (name: string, color: string) => {
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      color,
      createdAt: Date.now(),
    };
    setDecks([...decks, newDeck]);
  };

  const handleUpdateDeck = (id: string, name: string, color: string) => {
    setDecks(decks.map(deck => 
      deck.id === id ? { ...deck, name, color } : deck
    ));
    setEditingDeck(null);
  };

  const handleDeleteDeck = (deckId: string) => {
    if (confirm('Are you sure? This will delete all cards in this deck.')) {
      setDecks(decks.filter(d => d.id !== deckId));
      setFlashcards(flashcards.filter(c => c.deckId !== deckId));
    }
  };

  const handleEditDeck = (deck: Deck) => {
    setEditingDeck(deck);
    setShowCreateDeck(true);
  };

  const getCardCount = (deckId: string) => {
    return flashcards.filter(card => card.deckId === deckId).length;
  };

  const handleStudy = (deckId: string) => {
    navigate(`/study/${deckId}`);
  };

  const handleAddCards = (deckId: string) => {
    navigate(`/cards?deck=${encodeURIComponent(deckId)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Library className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight">flashcardfordumbs</h1>
              <p className="text-sm text-muted-foreground">
                Flashcards without the fluff
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3 sm:pr-1">
            <Button variant="outline" onClick={() => navigate('/statistics')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistics
            </Button>
            <Button variant="outline" onClick={() => navigate('/cards')}>
              Manage Cards
            </Button>
            <Button onClick={() => setShowCreateDeck(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Deck
            </Button>
          </div>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-16">
            <Library className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No decks yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first deck to start organizing your flashcards
            </p>
            <Button onClick={() => setShowCreateDeck(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Deck
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(deck => (
              <DeckCard
                key={deck.id}
                deck={deck}
                cardCount={getCardCount(deck.id)}
                onStudy={handleStudy}
                onAddCards={handleAddCards}
                onEdit={handleEditDeck}
                onDelete={handleDeleteDeck}
              />
            ))}
          </div>
        )}
      </div>

      <CreateDeckDialog
        open={showCreateDeck}
        onOpenChange={(open) => {
          setShowCreateDeck(open);
          if (!open) setEditingDeck(null);
        }}
        onCreateDeck={handleCreateDeck}
        editingDeck={editingDeck}
        onUpdateDeck={handleUpdateDeck}
      />
    </div>
  );
}