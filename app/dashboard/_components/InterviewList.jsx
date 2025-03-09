"use client";
import { useUser } from "@clerk/nextjs";
import { db } from "../../../utils/db";
import { Mk } from "../../../utils/schema";
import React, { useEffect, useState } from "react";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import InterviewItemCard from "./InterviewItemCard";
function InterviewList() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  useEffect(() => {
    user && GetInterviewList();
  }, [user]);
  const GetInterviewList = async () => {
    const res = await db
      .select()
      .from(Mk)
      .where(eq(Mk.createdBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(Mk.id));
    console.log(res);
    setInterviewList(res);
  };
  useEffect(() => {
    GetInterviewList();
  }, []);
  return (
    <div>
      <h2 className="text-xl font-medium">Previous Interviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-5">
        {interviewList &&
          interviewList.map((interview, index) => (
            <InterviewItemCard interview={interview} key={index} />
          ))}
      </div>
    </div>
  );
}

export default InterviewList;
