// dashboard page that shows user info and has a logout button

import { headers } from "next/headers";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { conversations, messages, offerings, prospects } from "@/db/schema";
import { MessagesChart } from "@/components/dashboard/message-chart";

type DailyPoint = {
  day: string;
  total: number;
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [messageCountRow] = await db
    .select({ value: count(messages.id) })
    .from(messages)
    .where(eq(messages.userId, userId));

  const [prospectCountRow] = await db
    .select({ value: count(prospects.id) })
    .from(prospects)
    .where(eq(prospects.userId, userId));

  const [offeringCountRow] = await db
    .select({ value: count(offerings.id) })
    .from(offerings)
    .where(eq(offerings.userId, userId));

  const [conversationCountRow] = await db
    .select({ value: count(conversations.id) })
    .from(conversations)
    .innerJoin(messages, eq(messages.id, conversations.messageId))
    .where(
      and(
        eq(messages.userId, userId),
        sql`jsonb_array_length(${conversations.thread}) > 1`,
      ),
    );

  const topOfferings = await db
    .select({
      offeringId: messages.offeringId,
      offeringName: offerings.name,
      usage: count(messages.id),
    })
    .from(messages)
    .innerJoin(offerings, eq(offerings.id, messages.offeringId))
    .where(eq(messages.userId, userId))
    .groupBy(messages.offeringId, offerings.name)
    .orderBy(desc(count(messages.id)))
    .limit(3);

  const rows = await db
    .select({
      day: sql<string>`to_char(${messages.createdAt}::date, 'YYYY-MM-DD')`,
      total: count(messages.id),
    })
    .from(messages)
    .where(
      and(eq(messages.userId, userId), gte(messages.createdAt, sevenDaysAgo)),
    )
    .groupBy(sql`${messages.createdAt}::date`)
    .orderBy(sql`${messages.createdAt}::date asc`);

  const chartData = buildLast7Days(rows);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-white/80">
        Core usage metrics from live database queries.
      </p>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Messages generated"
          value={messageCountRow?.value ?? 0}
        />
        <StatCard
          label="Prospects saved"
          value={prospectCountRow?.value ?? 0}
        />
        <StatCard
          label="Offerings created"
          value={offeringCountRow?.value ?? 0}
        />
        <StatCard
          label="Conversations with replies"
          value={conversationCountRow?.value ?? 0}
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white-200 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
            Top offerings by usage
          </h2>
          {topOfferings.length === 0 ? (
            <p className="mt-3 text-sm text-white/80">No message usage yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {topOfferings.map((item) => (
                <li
                  key={item.offeringId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-white-800">{item.offeringName}</span>
                  <span className="font-medium">{item.usage}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-white-200 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
            Messages per day (last 7 days)
          </h2>
          <MessagesChart data={chartData} />
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function buildLast7Days(rows: DailyPoint[]): DailyPoint[] {
  const byDay = new Map(rows.map((row) => [row.day, Number(row.total)]));
  const points: DailyPoint[] = [];

  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = date.toISOString().slice(0, 10);

    points.push({
      day: key.slice(5),
      total: byDay.get(key) ?? 0,
    });
  }

  return points;
}
