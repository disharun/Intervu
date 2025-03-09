"use client";
import { userAnswer } from "../../../../../utils/schema";
import React, { useEffect, useState } from "react";
import { db } from "../../../../../utils/db";
import { eq } from "drizzle-orm";
import { use } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../../components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { useRouter } from "next/navigation";

function Feedback({ params }) {
  const unwrappedParams = use(params);
  const [feedbacklist, setFeedbackList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    GetFeedback();
  }, [unwrappedParams]);

  const GetFeedback = async () => {
    const res = await db
      .select()
      .from(userAnswer)
      .where(eq(userAnswer.mockIdRef, unwrappedParams.interviewId))
      .orderBy(userAnswer.id);
    setFeedbackList(res);
  };

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold text-green-500">Congratulations!</h2>
      <h2 className="text-2xl font-bold">Here is your interview feedback</h2>
      {feedbacklist?.length === 0 ? (
        <h2 className="text-lg text-red-500">No feedback available</h2>
      ) : null}

      <h2 className="text-lg my-3 text-blue-300">
        Your overall rating <strong>7/10</strong>
      </h2>
      <h2 className="text-sm text-gray-500">
        Find below interview question with correct Answer, your answer and
        feedback for improvement
      </h2>
      {feedbacklist &&
        feedbacklist.map((item, index) => (
          <Collapsible key={index} className="mt-7">
            <CollapsibleTrigger className="p-2 bg-secondary rounded-lg my-2 flex justify-between gap-10 w-full text-left">
              {item.question}
              <ChevronsUpDown className="h-5 w-5" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="flex flex-col gap-2">
                <p className=" text-blue-500 p-2 border rounded-lg bg-blue-50">
                  <strong>Correct Answer:</strong> {item.correctanswer}
                </p>
                <p className=" text-green-500  bg-green-50 p-2 border rounded-lg">
                  <strong>Your Answer:</strong> {item.useranswer}
                </p>
                <p className=" text-yellow-500 p-2 border rounded-lg bg-yellow-50">
                  <strong>Feedback:</strong> {item.feedback}
                </p>
                <p className=" text-red-500 p-2 border rounded-lg bg-red-50">
                  <strong>Rating:</strong> {item.rating}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      <Button onClick={() => router.replace("/dashboard")}>Go Home</Button>
    </div>
  );
}

export default Feedback;
