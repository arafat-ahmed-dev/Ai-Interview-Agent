import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/action/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/action/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");
  if (!user) redirect("/sign-in");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id,
  });

  if (!feedback) {
    return (
      <section className="section-feedback">
        <div className="card-border w-full max-w-2xl mx-auto my-12">
          <div className="card p-10 flex flex-col items-center gap-6 text-center">
            <h2 className="text-2xl font-bold capitalize">
              {interview.role} Interview
            </h2>
            <p className="text-light-100 max-w-md">
              You have not completed this interview yet. Complete the mock
              interview session with the AI agent to receive your detailed
              evaluation and score.
            </p>
            <div className="flex gap-4 w-full justify-center mt-4 max-sm:flex-col">
              <Button className="btn-secondary" asChild>
                <Link href="/">Back to Dashboard</Link>
              </Button>
              <Button className="btn-primary" asChild>
                <Link href={`/interview/${id}`}>Take Interview Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-feedback space-y-8">
      <div className="flex flex-col gap-2 items-center text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold">
          Interview Evaluation Report
        </h1>
        <p className="text-xl text-primary-100 capitalize">
          {interview.role} Interview ({interview.type})
        </p>
      </div>

      <div className="card-border w-full">
        <div className="card p-6 flex flex-row justify-around items-center max-sm:flex-col max-sm:gap-4">
          {/* Overall Impression */}
          <div className="flex flex-row gap-3 items-center">
            <Image src="/star.svg" width={28} height={28} alt="star" />
            <div>
              <p className="text-xs uppercase tracking-wider text-light-100/70">Overall Score</p>
              <p className="text-2xl font-bold">
                <span className="text-primary-200">{feedback.totalScore}</span>
                <span className="text-light-100/60 text-lg"> / 100</span>
              </p>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-dark-200 max-sm:hidden" />

          {/* Date */}
          <div className="flex flex-row gap-3 items-center">
            <Image src="/calendar.svg" width={28} height={28} alt="calendar" />
            <div>
              <p className="text-xs uppercase tracking-wider text-light-100/70">Completed On</p>
              <p className="text-base font-medium text-white">
                {feedback.createdAt
                  ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Assessment */}
      <div className="card-border w-full">
        <div className="card p-6 space-y-3">
          <h3 className="text-xl font-semibold text-primary-100">Executive Summary</h3>
          <p className="text-light-100 leading-relaxed">{feedback.finalAssessment}</p>
        </div>
      </div>

      {/* Interview Breakdown */}
      <div className="space-y-4">
        <h2>Category Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedback.categoryScores?.map((category, index) => (
            <div key={index} className="card-border">
              <div className="card p-5 space-y-2 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-white text-base">
                      {category.name}
                    </p>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-200/20 text-primary-200 border border-primary-200/30">
                      {category.score}/100
                    </span>
                  </div>
                  <p className="text-sm text-light-100/90 leading-relaxed mt-2">
                    {category.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-border">
          <div className="card p-6 space-y-3 h-full">
            <h3 className="text-success-100 font-semibold flex items-center gap-2">
              <span>✓</span> Strengths
            </h3>
            <ul className="space-y-2 list-none p-0">
              {feedback.strengths?.map((strength, index) => (
                <li key={index} className="text-sm text-light-100 flex items-start gap-2">
                  <span className="text-success-100 mt-0.5">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card-border">
          <div className="card p-6 space-y-3 h-full">
            <h3 className="text-destructive-100 font-semibold flex items-center gap-2">
              <span>▲</span> Areas for Improvement
            </h3>
            <ul className="space-y-2 list-none p-0">
              {feedback.areasForImprovement?.map((area, index) => (
                <li key={index} className="text-sm text-light-100 flex items-start gap-2">
                  <span className="text-destructive-100 mt-0.5">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="buttons flex gap-4 pt-4">
        <Button className="btn-secondary flex-1" asChild>
          <Link href="/" className="flex w-full justify-center">
            Back to Dashboard
          </Link>
        </Button>

        <Button className="btn-primary flex-1" asChild>
          <Link
            href={`/interview/${id}`}
            className="flex w-full justify-center text-black"
          >
            Retake Interview
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Feedback;
