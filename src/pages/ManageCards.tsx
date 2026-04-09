import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from '../components/ui/button';
import { CreateCardDialog } from '../components/CreateCardDialog';
import { Card } from '../components/ui/card';
import { ArrowLeft, Plus, Edit2, Trash2, Search, Star } from 'lucide-react';
import { Deck, Flashcard } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

export function ManageCards() {
  const navigate = useNavigate();
  const [decks] = useLocalStorage<Deck[]>('flashcard-decks', []);
  const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>('flashcards', []);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [filterDeck, setFilterDeck] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateCard = (question: string, answer: string, deckId: string, isFavorite: boolean, difficulty?: 'easy' | 'medium' | 'hard') => {
    const newCard: Flashcard = {
      id: crypto.randomUUID(),
      question,
      answer,
      deckId,
      createdAt: Date.now(),
      isFavorite,
      difficulty,
      timesStudied: 0,
      correctCount: 0,
      incorrectCount: 0,
    };
    setFlashcards([...flashcards, newCard]);
  };

  const handleUpdateCard = (id: string, question: string, answer: string, deckId: string, isFavorite: boolean, difficulty?: 'easy' | 'medium' | 'hard') => {
    setFlashcards(flashcards.map(card =>
      card.id === id ? { ...card, question, answer, deckId, isFavorite, difficulty } : card
    ));
    setEditingCard(null);
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      setFlashcards(flashcards.filter(c => c.id !== id));
    }
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setShowCreateCard(true);
  };

  const getDeckName = (deckId: string) => {
    return decks.find(d => d.id === deckId)?.name || 'Unknown Deck';
  };

  const getDeckColor = (deckId: string) => {
    return decks.find(d => d.id === deckId)?.color || '#3b82f6';
  };

  const filteredCards = flashcards.filter(card => {
    const matchesDeck = filterDeck === 'all' || card.deckId === filterDeck;
    const matchesSearch = searchQuery === '' || 
      card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDeck && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold">Manage Flashcards</h1>
          </div>
          <Button 
            onClick={() => setShowCreateCard(true)}
            disabled={decks.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Card
          </Button>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              You need to create a deck first before adding cards
            </p>
            <Button onClick={() => navigate('/')}>
              Go to Decks
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterDeck} onValueChange={setFilterDeck}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Decks</SelectItem>
                  {decks.map(deck => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredCards.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">
                  {searchQuery || filterDeck !== 'all' 
                    ? 'No cards match your filters' 
                    : 'No flashcards yet'}
                </p>
                {!searchQuery && filterDeck === 'all' && (
                  <Button onClick={() => setShowCreateCard(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Card
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCards.map(card => (
                  <Card key={card.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: getDeckColor(card.deckId) }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {getDeckName(card.deckId)}
                          </span>
                          {card.isFavorite && (
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          )}
                          {card.difficulty && (
                            <Badge 
                              variant="outline"
                              className={
                                card.difficulty === 'easy' ? 'border-green-500 text-green-600' :
                                card.difficulty === 'medium' ? 'border-yellow-500 text-yellow-600' :
                                'border-red-500 text-red-600'
                              }
                            >
                              {card.difficulty}
                            </Badge>
                          )}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Question</div>
                            <p className="text-foreground">{card.question}</p>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Answer</div>
                            <p className="text-muted-foreground">{card.answer}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCard(card)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <CreateCardDialog
        open={showCreateCard}
        onOpenChange={(open) => {
          setShowCreateCard(open);
          if (!open) setEditingCard(null);
        }}
        decks={decks}
        onCreateCard={handleCreateCard}
        editingCard={editingCard}
        onUpdateCard={handleUpdateCard}
      />
    </div>
  );
}