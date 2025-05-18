import { Lightbulb, Volume2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

function QuestionSection({ mockinterViewQuestions, activeQuestionIndex }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const texttospeech = (text) => {
    if ("speechSynthesis" in window) {
      try {
        if (isSpeaking) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          return;
        }

        let speech = new SpeechSynthesisUtterance(text);
        speech.onend = () => setIsSpeaking(false);
        speech.onerror = () => {
          setIsSpeaking(false);
          toast.error("Failed to play speech");
        };

        setIsSpeaking(true);
        window.speechSynthesis.speak(speech);
      } catch (error) {
        console.error("Speech synthesis error:", error);
        toast.error("Failed to play speech");
      }
    } else {
      toast.error("Your browser doesn't support text to speech");
    }
  };

  if (!mockinterViewQuestions?.length) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <p className="text-center text-muted-foreground">
          No questions available
        </p>
      </div>
    );
  }

  const currentQuestion = mockinterViewQuestions[activeQuestionIndex];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-center">
        {mockinterViewQuestions.map((_, index) => (
          <div
            key={index}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                activeQuestionIndex === index
                  ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/50"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
          >
            Q{index + 1}
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Current Question</h3>
            <button
              onClick={() => texttospeech(currentQuestion.question)}
              className={`p-2 rounded-full transition-all hover:bg-secondary
                ${isSpeaking ? "text-primary" : "text-muted-foreground"}`}
            >
              <Volume2
                className={`h-5 w-5 ${isSpeaking ? "animate-pulse" : ""}`}
              />
            </button>
          </div>

          <div className="rounded-lg bg-card p-4 border">
            <p className="text-lg">{currentQuestion.question}</p>
          </div>

          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/50 p-4 border border-yellow-200 dark:border-yellow-900">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2">
              <Lightbulb className="h-5 w-5" />
              <strong>Tips</strong>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
              <li>Take a moment to organize your thoughts</li>
              <li>Use specific examples from your experience</li>
              <li>Keep your answer clear and concise</li>
              <li>Address all parts of the question</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionSection;
