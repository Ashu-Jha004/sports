import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      {/* Clerk's built-in sign-in component */}
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        fallbackRedirectUrl={"/profile"}
        fallback={"/profile"}
      />
    </div>
  );
}
