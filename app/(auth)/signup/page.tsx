// login page with email and password form

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type SignupResponse = {
  error?: {
    message?: string;
  };
};

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = (await response.json()) as SignupResponse;

      if (!response.ok) {
        setErrorMessage(data.error?.message ?? "Unable to create account.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-10">
      <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-xl border border-white-200 p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-white/80">Set up your Kakiyo Outreach workspace.</p>
        </div>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Name</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
          />
        </label>

        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-white-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm text-white/80">
          Already have an account?{" "}
          <a href="/login" className="font-medium text-black underline">
            Log in
          </a>
        </p>
      </form>
    </main>
  );
}   