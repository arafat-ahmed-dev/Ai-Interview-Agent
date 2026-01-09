"use client";

import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import FormField from "@/components/FormField";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/action/auth.action";

function getFriendlyAuthMessage(code?: string, fallback?: string) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password. Please try again.";
    case "auth/user-not-found":
      return "No account found with that email. Please sign up first.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/email-already-in-use":
      return "That email is already in use. Try signing in instead.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    default:
      return fallback || "Something went wrong. Please try again.";
  }
}

const authFormSchema = (type: FormType) => {
  return z.object({
    name:
      type === "sign-up" ? z.string().min(3).max(50) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6).max(50),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const isSignIn = type === "sign-in";
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-up") {
        const { name, email, password } = values;
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email,
          password,
        });
        if (!result?.success) {
          toast.error(
            result?.message || "Failed to create account. Please try again."
          );
          return;
        }
        toast.success("Account created successfully. Please sign in!");
        router.push("/sign-in");
        console.log("sign-up", values);
      } else {
        const { email, password } = values;
        console.log("email", email);
        console.log("password", password);
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log("userCredential", userCredential);
        const idToken = await userCredential.user.getIdToken();
        console.log("idToken", idToken);
        if (!idToken) {
          toast.error("Sign in Failed!");
          return;
        }
        console.log("signIn", values);
        const result = await signIn({
          email,
          idToken,
        });
        if (result && !result.success) {
          toast.error(result.message || "Failed to sign in. Please try again.");
          return;
        }
        toast.success("Signed in successfully.");
        router.push("/");
        console.log("sign-in", values);
      }
    } catch (e) {
      console.error(e);
      const err = e as { code?: string; message?: string };
      const friendly = getFriendlyAuthMessage(err?.code, err?.message);
      toast.error(friendly);
    }
  }
  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="loog" height={32} width={38} />
          <h2 className="text-primary-100">PreWise</h2>
        </div>
        <h3>Practice job interviews with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name={"name"}
                label={"Name"}
                type="text"
                placeholder={"Enter your Name"}
              />
            )}
            <FormField
              control={form.control}
              name={"email"}
              label={"Email"}
              type="email"
              placeholder={"Enter your email"}
            />
            <FormField
              control={form.control}
              name={"password"}
              label={"Password"}
              type="password"
              placeholder={"Enter your password"}
            />
            <Button type="submit" className={"btn"}>
              {isSignIn ? "Sign in" : "Create an Account"}
            </Button>
          </form>
        </Form>
        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </Link>
        </p>
        {isSignIn && (
          <p className="text-center">
            <Link
              href={"/forgot-password"}
              className="font-bold text-user-primary ml-1"
            >
              Forgot Password?
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
