import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center">
          🚀 SaaS Boilerplate
        </h1>
        <p className="text-xl text-muted-foreground text-center max-w-2xl">
          Industrial-grade full-stack boilerplate with FastAPI, Next.js 14, PostgreSQL,
          and all the tools you need for production.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-md bg-primary px-6 py-3 text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-border px-6 py-3 font-semibold hover:bg-accent transition-colors"
          >
            Dashboard
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const features = [
  {
    title: "⚡ FastAPI Backend",
    description:
      "Python 3.12+, SQLAlchemy 2.0 async, JWT auth, rate limiting, and strict type safety.",
  },
  {
    title: "🎨 Next.js 14 Frontend",
    description:
      "App Router, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, and Zustand.",
  },
  {
    title: "🐳 Docker Ready",
    description:
      "Multi-stage Dockerfiles, docker-compose for local dev, GitHub Actions CI/CD.",
  },
];
