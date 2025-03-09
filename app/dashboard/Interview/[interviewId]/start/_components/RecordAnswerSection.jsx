"use client";
import { Button } from "../../../../../../components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import useSpeechToText from "react-hook-speech-to-text";
import { StopCircle } from "lucide-react";
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
    const result = await chatSession.sendMessage(feedbackPrompt);
    const responseText = await result.response.text();
    const jsonMockResp = responseText
      .replace("```json", "")
      .replace("```", "")
      .trim();
    console.log(jsonMockResp);

    let Jsonfeedbackresp;
    try {
      Jsonfeedbackresp = JSON.parse(jsonMockResp);
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      toast("Failed to parse feedback response");
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
      toast("success");
      setUserAnswer("");
      setResults([]);
    }
    setResults([]);

    setLoading(false);
  };

  return (
    <div>
      <div className="flex flex-col justify-center items-center bg-white border rounded-lg shadow-lg p-5 relative">
        <Image
          src="/webcam.png"
          alt="Webcam"
          width={150}
          height={150}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-100"
        />
        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: "100%",
            zIndex: 10,
          }}
        />
      </div>

      <Button
        disabled={loading}
        variant="outline"
        className="my-10 justify-center items-center w-full bg-primary text-white"
        onClick={SaveUserAnswer}
      >
        {isRecording ? (
          <h2 className="text-red-600 animate-pulse flex gap-2 items-center justify-center">
            <StopCircle />
            Stop Recording
          </h2>
        ) : (
          <h2>Record Answer</h2>
        )}
      </Button>
    </div>
  );
}

export default RecordAnswerSection;
