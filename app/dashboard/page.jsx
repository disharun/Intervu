"use client";
import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";

function Dashboard() {
  return (
    <div className="p-10">
      <h2 className="font-bold text-xl">
        Create and Start your first Experience
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        <AddNewInterview />
      </div>
      <InterviewList />
    </div>
  );
}

export default Dashboard;
