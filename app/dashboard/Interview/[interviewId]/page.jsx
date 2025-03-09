"use client";
import { Mk } from "../../../../utils/schema";
import React, { useEffect, useState } from "react";
import { db } from "../../../../utils/db";
import { eq } from "drizzle-orm";
import { useParams } from "next/navigation";
import { Lightbulb, Link, Link2, WebcamIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import Webcam from "react-webcam";

function Interview({}) {
  const params = useParams();
  const [interviewDetails, setInterviewDetails] = useState();
  const [WebcamEnabled, setWebcamEnabled] = useState(false);

  useEffect(() => {
    console.log(params.interviewId);
    GetInterviewDetails();
  }, [params.interviewId]);
  const GetInterviewDetails = async () => {
    const res = await db
      .select()
      .from(Mk)
      .where(eq(Mk.mockId, params.interviewId));
    setInterviewDetails(res[0]);
    console.log(res);
  };

  return (
    <div className="my-10 ">
      <h2 className="font-bold text-2xl">Let's Start Now.</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-5 my-5">
          <div className="flex flex-col gap-5 p-5 rounded-lg border ">
            <h2 className="text-lg">
              <strong>Job role/Job Position:</strong>
              {interviewDetails?.jobPosition}
            </h2>
            <h2 className="text-lg">
              <strong>Job Description:</strong>
              {interviewDetails?.jobDesc}
            </h2>
            <h2 className="text-lg">
              <strong>Years of Experience:</strong>
              {interviewDetails?.jobExp}
            </h2>
          </div>
          <div className="p-5 rounded-lg border border-yellow-300 bg-yellow-100">
            <h2 className="flex gap-2 items-center text-yellow-500">
              <Lightbulb /> <strong>Information</strong>
            </h2>
            <h2 className="mt-3 text-yellow-500">
              {process.env.NEXT_PUBLIC_INFORMATION}
            </h2>
          </div>
        </div>

        <div>
          {WebcamEnabled ? (
            <>
              <Webcam
                onUserMedia={() => {
                  setWebcamEnabled(true);
                }}
                onUserMediaError={() => {
                  setWebcamEnabled(false);
                }}
                mirrored={true}
                style={{ width: 300, height: 300 }}
              />{" "}
              :
            </>
          ) : (
            <>
              <WebcamIcon className="w-full h-72 my-7 bg-secondary p-20 border rounded-lg" />
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setWebcamEnabled(true)}
              >
                Enable your webcam and Microphone.
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-end items-end cursor-pointer mt-5">
        <a href={"/dashboard/Interview/" + params.interviewId + "/start"}>
          <Button>Start Interview</Button>
        </a>
      </div>
    </div>
  );
}

export default Interview;
