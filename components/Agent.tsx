"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/action/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingFeedback, setIsAnalyzingFeedback] = useState(false);
  const generationCompleteRef = useRef(false);
  const feedbackProcessingRef = useRef(false);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      // Only set finished if generation is complete or if it's not a generate type
      if (type !== "generate" || generationCompleteRef.current) {
        setCallStatus(CallStatus.FINISHED);
      } else if (type === "generate" && !generationCompleteRef.current) {
        // For generate type, if call ended prematurely, show a message
        console.log("Call ended - checking if generation completed...");
        // Give a small delay to check if workflow completed successfully
        setTimeout(() => {
          if (!generationCompleteRef.current) {
            toast.info("Processing your interview setup...");
            setCallStatus(CallStatus.FINISHED);
          }
        }, 2000);
      }
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }

      // Listen for workflow/function completion messages
      if (message.type === "function-call-result") {
        console.log("Function call result:", message);
        const result = message.functionCallResult?.result as { success?: boolean } | undefined;
        if (result?.success) {
          generationCompleteRef.current = true;
          setIsGenerating(false);
          toast.success("Interview questions generated successfully!");
        }
      }

      // Listen for function call to track when generation starts
      if (message.type === "function-call") {
        console.log("Function call:", message);
        setIsGenerating(true);
        toast.info("Generating your interview questions...");
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
      toast.error("An error occurred during the call. Please try again.");
      setIsGenerating(false);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [type]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    if (callStatus !== CallStatus.FINISHED) return;

    if (type === "generate") {
      router.push("/");
      return;
    }

    if (feedbackProcessingRef.current) return;
    feedbackProcessingRef.current = true;

    if (!messages || messages.length < 2) {
      toast.info("Interview ended early. Not enough dialogue to evaluate.");
      router.push("/");
      return;
    }

    const processFeedback = async () => {
      setIsAnalyzingFeedback(true);
      toast.info("Generating your interview performance report...");

      try {
        const result = await createFeedback({
          interviewId: interviewId!,
          userId: userId!,
          transcript: messages,
          feedbackId,
        });

        if (result.success && result.feedbackId) {
          toast.success("Interview report ready!");
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          toast.error(
            (result as { message?: string })?.message ||
              "Failed to evaluate interview feedback."
          );
          router.push("/");
        }
      } catch (err) {
        console.error("Error saving feedback:", err);
        toast.error("An error occurred while generating your report.");
        router.push("/");
      } finally {
        setIsAnalyzingFeedback(false);
      }
    };

    processFeedback();
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    generationCompleteRef.current = false;
    feedbackProcessingRef.current = false;

    try {
      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error) {
      console.error("Failed to start call:", error);
      toast.error("Failed to start the call. Please try again.");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = () => {
    if (isGenerating) {
      toast.warning("Please wait, interview questions are being generated...");
      return;
    }
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
          {isGenerating && (
            <p className="text-sm text-primary-200 animate-pulse">
              Generating questions...
            </p>
          )}
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100",
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {isAnalyzingFeedback && (
        <div className="card-border w-full">
          <div className="card p-6 flex flex-col items-center justify-center gap-3">
            <div className="size-8 border-3 border-primary-200 border-t-transparent rounded-full animate-spin" />
            <p className="text-primary-100 font-medium animate-pulse text-center">
              Evaluating your interview responses & calculating score...
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative btn-call"
            onClick={() => handleCall()}
            disabled={isAnalyzingFeedback}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden",
              )}
            />

            <span className="relative">
              {isAnalyzingFeedback
                ? "Analyzing..."
                : callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
