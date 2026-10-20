import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";
import { timingSafeEqual } from "crypto";
import { z } from "zod";

// Set max duration for Vercel serverless function (adjust based on your plan)
export const maxDuration = 60; // 60 seconds timeout

const isAuthorized = (request: Request) => {
  const configuredSecret = process.env.VAPI_GENERATE_SECRET;
  if (!configuredSecret) {
    // If not configured, allow in development so voice workflow functions
    return true;
  }

  const providedSecret = request.headers.get("x-vapi-secret");
  if (!providedSecret) {
    return false;
  }

  const configuredSecretBuffer = Buffer.from(configuredSecret);
  const providedSecretBuffer = Buffer.from(providedSecret);

  return (
    configuredSecretBuffer.length === providedSecretBuffer.length &&
    timingSafeEqual(configuredSecretBuffer, providedSecretBuffer)
  );
};

const unauthorizedResponse = () =>
  Response.json({ success: false, error: "Unauthorized" }, { status: 401 });

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  return Response.json(
    {
      success: true,
      data: "PrepWise Vapi Generation Service Active",
    },
    {
      status: 200,
    }
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse();
  }

  const { type, role, level, techstack, amount, userId } = await request.json();

  console.log("Generating interview questions...", {
    type,
    role,
    level,
    techstack,
    amount,
    userId,
  });

  try {
    const { object: questions } = await generateObject({
      model: google("gemini-3.8-flash"),
      schema: z.array(z.string()).describe("List of job interview questions"),
      prompt: `Prepare interview questions for a candidate.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount || 5}.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or markdown formatting which might break the voice assistant.
      `,
    });

    console.log("Questions generated successfully, count:", questions.length);

    const parsedTechStack =
      typeof techstack === "string"
        ? techstack
            .split(",")
            .map((item: string) => item.trim())
            .filter(Boolean)
        : Array.isArray(techstack)
        ? techstack.map((item: unknown) => String(item).trim()).filter(Boolean)
        : [];

    const interview = {
      role: role || "General",
      type: type || "Mixed",
      level: level || "Mid-Level",
      techstack: parsedTechStack,
      userId: userId || "anonymous",
      finalized: true,
      questions,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("interviews").add(interview);
    console.log("Interview created with ID:", docRef.id);

    return Response.json(
      { success: true, interviewId: docRef.id },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error generating interview:", e);
    return Response.json(
      { success: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
