import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";
import { timingSafeEqual } from "crypto";

// Set max duration for Vercel serverless function (adjust based on your plan)
export const maxDuration = 60; // 60 seconds timeout

const isAuthorized = (request: Request) => {
  const configuredSecret = process.env.VAPI_GENERATE_SECRET;
  const providedSecret = request.headers.get("x-vapi-secret");

  if (!configuredSecret || !providedSecret) {
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
      data: "Thank You",
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
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
      `,
    });

    console.log("Questions generated:", questions);

    // Validate and sanitize the response
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(questions.trim());
      if (!Array.isArray(parsedQuestions)) {
        throw new Error("Questions are not in the expected array format.");
      }
    } catch (error) {
      console.error("Failed to parse questions:", error);
      throw new Error("Invalid questions format received from AI model.");
    }

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      userId,
      finalized: true,
      questions: parsedQuestions,
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
