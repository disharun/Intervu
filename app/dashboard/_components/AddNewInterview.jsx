"use client";
import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { chatSession } from "../../../utils/GeminiAi";
import { LoaderCircle } from "lucide-react";
import { db } from "../../../utils/db";
import { Mk } from "../../../utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobRole, setJobRole] = useState();
  const [jobDescription, setJobDescription] = useState();
  const [yearsOfExperience, setYearsOfExperience] = useState();
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const router = useRouter();
  const { user } = useUser();

  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();
    console.log(jobRole, jobDescription, yearsOfExperience);
    const InputPrompt = `Job Role: ${jobRole} \n Job Description: ${jobDescription} \n Years of Experience: ${yearsOfExperience} Depending on the job role , job description and years of experience, give us ${process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_NUMBER} interview questions that can be asked in the interview in JSON format.Give me question and answer pairs for the interview as field in JSON format. `;
    const result = await chatSession.sendMessage(InputPrompt);
    const Jsonform = result.response
      .text()
      .replace("```json", "")
      .replace("```", "");
    console.log(JSON.parse(Jsonform));
    setJsonResponse(Jsonform);

    if (Jsonform) {
      const resp = await db
        .insert(Mk)
        .values({
          mockId: uuidv4(),
          jsonMockResp: Jsonform,
          jobPosition: jobRole,
          jobDesc: jobDescription,
          jobExp: yearsOfExperience,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format("DD-MM-YYYY"),
        })
        .returning({ mockId: Mk.mockId });
      console.log("Inserted DB", resp);
      if (resp) {
        setOpenDialog(false);
        router.push(`/dashboard/Interview/` + resp[0]?.mockId);
      }
    } else {
      console.log("ERROR");
    }

    setLoading(false);
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 transition-all cursor-pointer hover:shadow-md"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className=" text-lg text-center">+ Add New</h2>
      </div>
      <Dialog open={openDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-2xl">
              Tell us more about your job interview
            </DialogTitle>
            <DialogDescription>
              Add Details about your job position/role, job description and
              years of experience
            </DialogDescription>
          </DialogHeader>
          <form action="onSubmit" onSubmit={handleSubmit}>
            <div className="mt-7 my-3">
              <label>Job role/job Position </label>
              <Input
                placeholder="Enter Job Role"
                required
                onChange={(event) => setJobRole(event.target.value)}
              />
            </div>
            <div className="my-3">
              <label>Job Description/Tech stack </label>
              <Textarea
                placeholder="Enter Job desc"
                required
                onChange={(event) => setJobDescription(event.target.value)}
              />
            </div>
            <div className="my-3">
              <label>Years of experience </label>
              <Input
                placeholder="5"
                type="number"
                max="50"
                required
                onChange={(event) => setYearsOfExperience(event.target.value)}
              />
            </div>

            <div className="flex gap-5 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    'Generating from AI'
                  </>
                ) : (
                  "Start Interview"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
