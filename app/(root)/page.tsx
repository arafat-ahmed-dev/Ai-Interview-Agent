import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/action/general.action";
import { getCurrentUser } from "@/lib/action/auth.action";

const Page = async () => {
  const user = await getCurrentUser();
  const [userInterviews, latestInterviews] = await Promise.all([
    user ? getInterviewsByUserId(user.id) : Promise.resolve(null),
    user ? getLatestInterviews({ userId: user.id }) : Promise.resolve(null),
  ]);
  const hasPastInterviews = Boolean(userInterviews && userInterviews.length > 0);
  const upcomingInterviews = Boolean(latestInterviews && latestInterviews.length > 0);

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice on real interview questions & get instant feedback
          </p>
          <Button className="btn-primary max-sm:w-full" asChild>
            <Link href="/interview" className="flex items-center gap-2">
              Start an Interview
            </Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="robot"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                {...interview}
                currentUserId={user?.id}
              />
            ))
          ) : (
            <div className="w-full py-8 text-center text-light-100/70 border border-dark-200 rounded-2xl bg-dark-200/30">
              <p>You haven&#39;t created any interviews yet. Click &quot;Start an Interview&quot; above to begin!</p>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>
        <div className="interviews-section">
          {upcomingInterviews ? (
            latestInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                {...interview}
                currentUserId={user?.id}
              />
            ))
          ) : (
            <div className="w-full py-8 text-center text-light-100/70 border border-dark-200 rounded-2xl bg-dark-200/30">
              <p>There are no community interviews available at this moment.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Page;
