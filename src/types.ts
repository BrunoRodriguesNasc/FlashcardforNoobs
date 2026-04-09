export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  deckId: string;
  createdAt: number;
  isFavorite?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  timesStudied?: number;
  correctCount?: number;
  incorrectCount?: number;
}

export interface Deck {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  description?: string;
}

export interface StudySession {
  id: string;
  deckId: string;
  cardsStudied: number;
  correctAnswers: number;
  incorrectAnswers: number;
  /** Session length in milliseconds */
  duration: number;
  date: number;
  studyMode: 'flashcard' | 'quiz';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}