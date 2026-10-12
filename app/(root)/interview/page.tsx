import React from "react";
import Agent from "@/components/Agent";
import {getCurrentUser} from "@/lib/action/auth.action";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <>
      <h3>Interview Generation</h3>
      <Agent userName={user.name} userId={user.id} type="generate" />
    </>
  );
};

export default Page;
