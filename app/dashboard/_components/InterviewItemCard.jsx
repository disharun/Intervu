import { Button } from "../../../components/ui/button";
import React from "react";
import { useRouter } from "next/navigation";

function InterviewItemCard({ interview }) {
  const router = useRouter();
  const onstartInterview = () => {
    router.push(`/dashboard/Interview/${interview.mockId}/start`);
  };
  const onFeedback = () => {
    router.push(`/dashboard/Interview/${interview.mockId}/feedback`);
  };
  return (
    <div className="border shadow-sm rounded-lg p-5 my-5">
      <h2 className="font-bold text-primary">{interview?.jobPosition}</h2>

      <h2 className="text-gray-400 text-sm font-bold">
        {interview?.jobExp} Years of Experience
      </h2>
      <h2 className="text-gray-600 text-xs">CreatedAt:{interview.createdAt}</h2>
      <div className="flex justify-between gap-5 mt-2">
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={onFeedback}
        >
          Feedback
        </Button>
        <Button size="sm" className="w-full" onClick={onstartInterview}>
          Start
        </Button>
      </div>
    </div>
  );
}

export default InterviewItemCard;
