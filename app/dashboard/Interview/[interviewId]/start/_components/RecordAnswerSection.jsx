"use client";
import { Button } from "../../../../../../components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { Loader2, Mic, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { chatSession } from "../../../../../../utils/GeminiAi";
import { db } from "../../../../../../utils/db";
import { userAnswer as userAnswerSchema } from "../../../../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import moment from "moment";

function RecordAnswerSection({
  mockinterViewQuestions,
  activeQuestionIndex,
  interviewDetails,
}) {
  const [userAnswer, setUserAnswer] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  useEffect(() => {
    if (results.length > 0) {
      setUserAnswer(
        (prevAns) => prevAns + results[results.length - 1]?.transcript
      );
    }
  }, [results]);

  useEffect(() => {
    if (!isRecording && userAnswer.length > 10) {
      UpdateUserAnswer();
    }
  }, [userAnswer]);

  const SaveUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const UpdateUserAnswer = async () => {
    if (!interviewDetails || !interviewDetails.mockId) {
      console.error("interviewDetails or mockId is undefined");
      return;
    }

    console.log(userAnswer);

    setLoading(true);
    const feedbackPrompt =
      "Question" +
      mockinterViewQuestions[activeQuestionIndex]?.question +
      ",user answer:" +
      userAnswer +
      ",depend on question and user answer for given interview questions" +
      "please give us rating for answer and feedback on area of improvement if any is there" +
      "in just 3 to 5 line to improve it in a only in JSON format with rating field and feedback field";

    try {
      const responseText = await chatSession.sendMessage(feedbackPrompt);
      console.log("Raw feedback response:", responseText);

      // Clean the response text
      const jsonMockResp = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      console.log("Cleaned feedback response:", jsonMockResp);

      let Jsonfeedbackresp;
      try {
        Jsonfeedbackresp = JSON.parse(jsonMockResp);
      } catch (error) {
        console.error("Failed to parse JSON response:", error);
        toast.error("Failed to parse feedback response");
        setLoading(false);
        return;
      }

      const resp = await db.insert(userAnswerSchema).values({
        mockIdRef: interviewDetails.mockId,
        question: mockinterViewQuestions[activeQuestionIndex]?.question,
        correctanswer: mockinterViewQuestions[activeQuestionIndex]?.answer,
        useranswer: userAnswer,
        feedback: Jsonfeedbackresp?.feedback,
        rating: Jsonfeedbackresp?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      if (resp) {
        toast.success("Answer recorded successfully");
        setUserAnswer("");
        setResults([]);
      }
      setResults([]);
    } catch (error) {
      console.error("Error processing feedback:", error);
      toast.error("Failed to process feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border bg-background shadow-lg transition-all">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 opacity-50" />
        <div className="relative p-6">
          <div className="aspect-video overflow-hidden rounded-lg bg-black/10 dark:bg-white/10">
            <Webcam mirrored={true} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {userAnswer && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-2 font-semibold">Your Answer:</h3>
            <p className="text-sm text-card-foreground">{userAnswer}</p>
          </div>
        )}

        <Button
          disabled={loading}
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          className="w-full transition-all hover:scale-[1.02]"
          onClick={SaveUserAnswer}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : isRecording ? (
            <div className="flex items-center gap-2">
              <StopCircle className="h-4 w-4" />
              <span>Stop Recording</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Start Recording</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}

export default RecordAnswerSection;
