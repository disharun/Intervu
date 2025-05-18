"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../../../../utils/db";
import { eq } from "drizzle-orm";
import { useParams } from "next/navigation";
import { Mk } from "../../../../../utils/schema";
import QuestionSection from "./_components/QuestionSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "../../../../../components/ui/button";
import Link from "next/link";
import { Loader2 } from "lucide-react";

function StartInterview() {
  const params = useParams();
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [mockinterViewQuestion, setMockinterViewQuestion] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params?.interviewId) {
      GetInterviewDetails();
    }
  }, [params?.interviewId]);

  const GetInterviewDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch interview from database
      const res = await db
        .select()
        .from(Mk)
        .where(eq(Mk.mockId, params.interviewId));

      if (!res || res.length === 0) {
        throw new Error("Interview not found");
      }

      const interview = res[0];
      console.log("Raw interview data:", interview);

      // Set basic interview details
      setInterviewDetails(interview);

      // Parse and validate the questions
      try {
        if (!interview.jsonMockResp) {
          console.error("No jsonMockResp found in interview data");
          throw new Error("No interview questions found");
        }

        console.log("Raw jsonMockResp:", interview.jsonMockResp);

        let parsedData;
        try {
          // Try to clean the data first
          const cleanedJson = interview.jsonMockResp
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

          console.log("Cleaned JSON:", cleanedJson);

          parsedData = JSON.parse(cleanedJson);
          console.log("Successfully parsed JSON:", parsedData);
        } catch (e) {
          console.error("JSON parse error details:", {
            error: e.message,
            stack: e.stack,
            rawData: interview.jsonMockResp,
          });
          throw new Error(
            "Failed to parse interview data - invalid JSON format"
          );
        }

        // Validate the data structure
        if (!parsedData || typeof parsedData !== "object") {
          console.error("Invalid data structure:", parsedData);
          throw new Error("Invalid interview data format - not an object");
        }

        // Check for either camelCase or snake_case key
        const questions =
          parsedData.interviewQuestions || parsedData.interview_questions;

        if (!questions) {
          console.error("Missing questions array:", parsedData);
          throw new Error(
            "Invalid interview data format - missing questions array"
          );
        }

        if (!Array.isArray(questions)) {
          throw new Error(
            "Invalid interview data format - questions must be an array"
          );
        }

        if (questions.length === 0) {
          throw new Error("No questions found in the interview");
        }

        // Validate each question
        questions.forEach((q, index) => {
          if (!q || typeof q !== "object") {
            throw new Error(`Question ${index + 1} is not a valid object`);
          }
          if (typeof q.question !== "string" || !q.question.trim()) {
            throw new Error(`Question ${index + 1} is missing or invalid`);
          }
          if (typeof q.answer !== "string" || !q.answer.trim()) {
            throw new Error(`Answer ${index + 1} is missing or invalid`);
          }
        });

        // Normalize to camelCase before setting state
        const normalizedData = {
          interviewQuestions: questions,
        };

        setMockinterViewQuestion(normalizedData.interviewQuestions);
        console.log(
          "Questions set successfully:",
          normalizedData.interviewQuestions
        );
      } catch (e) {
        console.error("Error processing interview data:", e);
        throw new Error("Failed to load interview questions: " + e.message);
      }
    } catch (e) {
      console.error("Error loading interview:", e);
      setError(e.message || "Failed to load interview");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your interview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Link href="/dashboard">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!mockinterViewQuestion.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p>No questions found for this interview.</p>
          <Link href="/dashboard">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="my-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <QuestionSection
          mockinterViewQuestions={mockinterViewQuestion}
          activeQuestionIndex={activeQuestionIndex}
        />
        <RecordAnswerSection
          mockinterViewQuestions={mockinterViewQuestion}
          activeQuestionIndex={activeQuestionIndex}
          interviewDetails={interviewDetails}
        />
      </div>
      <div className="flex justify-end gap-5 mt-5">
        {activeQuestionIndex > 0 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
          >
            Previous
          </Button>
        )}
        {activeQuestionIndex !== mockinterViewQuestion.length - 1 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
          >
            Next
          </Button>
        )}
        {activeQuestionIndex === mockinterViewQuestion.length - 1 && (
          <Link
            href={
              "/dashboard/Interview/" + interviewDetails?.mockId + "/feedback"
            }
          >
            <Button>End</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default StartInterview;
