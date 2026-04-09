import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { RotateCcw } from 'lucide-react';

interface FlashcardDisplayProps {
  question: string;
  answer: string;
  cardNumber: number;
  totalCards: number;
}

export function FlashcardDisplay({ question, answer, cardNumber, totalCards }: FlashcardDisplayProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-sm">
          <span className="font-semibold">Card {cardNumber}</span>
          <span className="text-muted-foreground">of {totalCards}</span>
        </div>
      </div>
      <div 
        className="perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="relative w-full h-96"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of card */}
          <Card 
            className="absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden border-2 shadow-xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4">
              <span className="text-2xl">❓</span>
            </div>
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-4 uppercase tracking-wide">Question</div>
            <div className="text-xl text-center font-medium px-4">{question}</div>
            <div className="mt-auto pt-8 flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <RotateCcw className="w-4 h-4" />
              <span>Click to reveal answer</span>
            </div>
          </Card>

          {/* Back of card */}
          <Card 
            className="absolute inset-0 p-8 flex flex-col items-center justify-center backface-hidden border-2 shadow-xl"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <div className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-wide">Answer</div>
            <div className="text-xl text-center font-medium text-white px-4">{answer}</div>
            <div className="mt-auto pt-8 flex items-center gap-2 text-sm text-white/80">
              <RotateCcw className="w-4 h-4" />
              <span>Click to see question</span>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}