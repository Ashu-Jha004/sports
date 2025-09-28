import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      {/* Clerk's built-in sign-up component */}
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        fallbackRedirectUrl={"/onboarding"}
        fallback={"/onboarding"}
      />
    </div>
  );
}
