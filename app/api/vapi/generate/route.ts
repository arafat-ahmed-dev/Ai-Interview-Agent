import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET() {
  return Response.json(
    {
      success: true,
      data: "Thank You",
    },
    {
      status: 200,
    },
  );
}
export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userId } = await request.json();
  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.\n" +
        "        The job role is ${role}.\n" +
        "        The job experience level is ${level}.\n" +
        "        The tech stack used in the job is: ${techstack}.\n" +
        "        The focus between behavioural and technical questions should lean towards: ${type}.\n" +
        "        The amount of questions required is: ${amount}.\n" +
        "        Please return only the questions, without any additional text.\n" +
        '        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.\n' +
        "        Return the questions formatted like this:\n" +
        '        ["Question 1", "Question 2", "Question 3"]\n' +
        "        \n" +
        "        Thank you! <3\n" +
        "    `,
    });
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      userId,
      finalized: true,
      questions: JSON.parse(questions),
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };
    await db.collection("interviews").add(interview);
    return Response.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return Response.json({ success: false, error: e }, { status: 500 });
  }
}
