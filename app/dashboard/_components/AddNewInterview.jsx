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
import { generateQuestions } from "../../../utils/GeminiAi";
import { LoaderCircle } from "lucide-react";
import { db } from "../../../utils/db";
import { Mk } from "../../../utils/schema";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobRole, setJobRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleSubmit = async (event) => {
    try {
      setLoading(true);
      event.preventDefault();

      // Generate questions using the optimized function
      const questionsData = await generateQuestions(
        jobRole,
        jobDescription,
        yearsOfExperience,
        process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_NUMBER || 5
      );

      console.log("Generated questions:", questionsData);

      if (
        !questionsData.interviewQuestions ||
        questionsData.interviewQuestions.length === 0
      ) {
        throw new Error("No questions were generated. Please try again.");
      }

      // Save to database
      const resp = await db
        .insert(Mk)
        .values({
          mockId: uuidv4(),
          jsonMockResp: JSON.stringify(questionsData),
          jobPosition: jobRole,
          jobDesc: jobDescription,
          jobExp: yearsOfExperience,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format("DD-MM-YYYY"),
        })
        .returning({ mockId: Mk.mockId });

      if (!resp?.[0]?.mockId) {
        throw new Error("Failed to save interview");
      }

      setOpenDialog(false);
      toast.success("Interview created successfully!");
      router.push(`/dashboard/Interview/${resp[0].mockId}`);
    } catch (error) {
      console.error("Error creating interview:", error);
      toast.error(error.message || "Failed to create interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="p-10 border rounded-lg bg-secondary hover:scale-105 transition-all cursor-pointer hover:shadow-md"
        onClick={() => setOpenDialog(true)}
      >
        <h2 className="text-lg text-center">+ Add New</h2>
      </div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Job role/job Position
              </label>
              <Input
                placeholder="e.g. Senior React Developer"
                required
                value={jobRole}
                onChange={(event) => setJobRole(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Job Description/Tech stack
              </label>
              <Textarea
                placeholder="e.g. React, Next.js, TypeScript, Node.js"
                required
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Years of experience</label>
              <Input
                type="number"
                placeholder="5"
                min="0"
                max="50"
                required
                value={yearsOfExperience}
                onChange={(event) => setYearsOfExperience(event.target.value)}
              />
            </div>

            <div className="flex gap-5 justify-end pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoaderCircle className="animate-spin" />
                    <span>Generating questions...</span>
                  </div>
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
