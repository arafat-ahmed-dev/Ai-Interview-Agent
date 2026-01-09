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
    user ? await getInterviewsByUserId(user.id) : null,
    user ? await getLatestInterviews({ userId: user.id }) : null,
  ]);
  const hasPastInterviews = userInterviews ? userInterviews.length > 0 : false;
  const upcomingInterviews = latestInterviews ? latestInterviews.length > 0 : false;
  console.log(userInterviews);
  
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className={"text-lg"}>
            Practice on real interview questions & get instant feedback
          </p>
          <Button className={"btn-primary max-sm:w-full"} asChild>
            <Link href={"/interview"} className={"flex items-center gap-2"}>
              Start an Interview
            </Link>
          </Button>
        </div>
        <Image
          src={"/robot.png"}
          alt={"robot"}
          width={400}
          height={400}
          className={"max-sm:hidden"}
        />
      </section>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className={"interviews-section"}>
          {hasPastInterviews ? (
            userInterviews?.map((interview, index) => (
              <InterviewCard key={index} {...interview} />
            ))
          ) : (
            <p>You haven&#39;t taken any interview yet</p>
          )}
        </div>
      </section>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>
        <div className={"interviews-section"}>
          {upcomingInterviews ? (
            latestInterviews?.map((interview, index) => (
              <InterviewCard key={index} {...interview} />
            ))
          ) : (
            <p>There are no interview available</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Page;
