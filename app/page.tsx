import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-10">
        <h1 className="text-center text-4xl font-bold text-white-900">
          Welcome to Kakiyo Outreach
        </h1>
        <p className="mt-4 text-center text-lg text-white/80">
          Your personalized outreach dashboard for smarter prospecting.
        </p>
        <div className="mt-10 w-full rounded-xl border border-white-200 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Get started</h2>
          <p className="mt-2 text-white/80">
            Create your first offering to start generating personalized messages.
          </p>
        </div>
      </main>
    </div>
  );
}
