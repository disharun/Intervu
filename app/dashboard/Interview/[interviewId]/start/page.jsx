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

function StartInterview() {
  const params = useParams();
  const [interviewDetails, setInterviewDetails] = useState();
  const [mockinterViewQuestion, setMockinterViewQuestion] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  useEffect(() => {
    GetInterviewDetails();
  }, [params]);

  const GetInterviewDetails = async () => {
    const res = await db
      .select()
      .from(Mk)
      .where(eq(Mk.mockId, params.interviewId));

    const jsonMockResp = JSON.parse(res[0].jsonMockResp);
    console.log("Parsed JSON:", jsonMockResp);

    // ✅ Extract correct data
    setMockinterViewQuestion(jsonMockResp.interviewQuestions || []);

    setInterviewDetails(res[0]);
  };

  // ✅ Log after state updates
  useEffect(() => {
    console.log("Updated mockinterViewQuestions:", mockinterViewQuestion);
  }, [mockinterViewQuestion]);

  return (
    <div className="my-10 ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Questions */}
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
        {activeQuestionIndex != mockinterViewQuestion?.length - 1 && (
          <Button
            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
          >
            Next
          </Button>
        )}
        {activeQuestionIndex == mockinterViewQuestion?.length - 1 && (
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
