import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Check, X } from 'lucide-react';
import type { Flashcard } from "../types";

interface QuizModeProps {
  card: Flashcard;
  allAnswers: string[];
  onAnswer: (correct: boolean) => void;
  cardNumber: number;
  totalCards: number;
}

export function QuizMode({ card, allAnswers, onAnswer, cardNumber, totalCards }: QuizModeProps) {
  const [quizType] = useState<'multiple-choice' | 'typing'>(
    Math.random() > 0.5 ? 'multiple-choice' : 'typing'
  );
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (quizType === 'multiple-choice') {
      // Generate multiple choice options
      const incorrectAnswers = allAnswers
        .filter(a => a !== card.answer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const allOptions = [card.answer, ...incorrectAnswers]
        .sort(() => Math.random() - 0.5);
      
      setOptions(allOptions);
    }
    setSelectedAnswer('');
    setTypedAnswer('');
    setShowResult(false);
  }, [card, quizType, allAnswers]);

  const handleSubmit = () => {
    const userAnswer = quizType === 'multiple-choice' ? selectedAnswer : typedAnswer;
    const correct = userAnswer.toLowerCase().trim() === card.answer.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleContinue = () => {
    onAnswer(isCorrect);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 text-center text-sm text-muted-foreground">
        Question {cardNumber} of {totalCards}
      </div>
      
      <Card className="p-8">
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-2">
            {quizType === 'multiple-choice' ? 'Multiple Choice' : 'Type Your Answer'}
          </div>
          <h2 className="text-2xl mb-6">{card.question}</h2>
        </div>

        {!showResult ? (
          <>
            {quizType === 'multiple-choice' ? (
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label 
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-accent"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              <Input
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && typedAnswer.trim()) {
                    handleSubmit();
                  }
                }}
                autoFocus
              />
            )}

            <Button
              className="w-full mt-6"
              onClick={handleSubmit}
              disabled={
                (quizType === 'multiple-choice' && !selectedAnswer) ||
                (quizType === 'typing' && !typedAnswer.trim())
              }
            >
              Submit Answer
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              isCorrect ? 'bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100' : 'bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100'
            }`}>
              {isCorrect ? (
                <>
                  <Check className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Correct!</div>
                    <div className="text-sm opacity-80">Well done!</div>
                  </div>
                </>
              ) : (
                <>
                  <X className="w-6 h-6" />
                  <div className="flex-1">
                    <div className="font-semibold">Incorrect</div>
                    <div className="text-sm opacity-80">The correct answer is: <strong>{card.answer}</strong></div>
                  </div>
                </>
              )}
            </div>

            <Button className="w-full" onClick={handleContinue}>
              Continue
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
