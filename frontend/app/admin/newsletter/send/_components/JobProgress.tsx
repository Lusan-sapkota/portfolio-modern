"use client";

import Link from "next/link";
import { INK, PAPER, SIENNA, INK_SOFT, BORDER, Pill } from "./ui";

type SendResponse = {
  job_id: string;
  queued: number;
  filter: string;
  started_at: string;
};

type JobStatus = {
  id: string;
  status: "running" | "completed";
  total: number;
  sent: number;
  failed: number;
  started_at: string;
  finished_at: string | null;
  errors: { id: number; email: string }[];
};

const ADMIN_ROUTE =
  process.env.NEXT_PUBLIC_ADMIN_ROUTE || "/configure-deafult-here";

type Props = {
  job: SendResponse;
  jobStatus: JobStatus | null;
  onReset: () => void;
};

export function JobProgress({ job, jobStatus, onReset }: Props) {
  const progress = jobStatus
    ? Math.round(((jobStatus.sent + jobStatus.failed) / jobStatus.total) * 100)
    : 0;

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14 max-w-[1400px] mx-auto">
      <header className="mb-10 pb-8" style={{ borderBottom: BORDER }}>
        <Link
          href={`${ADMIN_ROUTE}/newsletter/send`}
          onClick={(e) => {
            e.preventDefault();
            onReset();
          }}
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: INK_SOFT }}
        >
          Compose another
        </Link>
        <h1
          className="font-black text-4xl lg:text-5xl tracking-[-0.04em] leading-[0.95] mt-3"
          style={{ color: INK }}
        >
          {jobStatus?.status === "completed" ? "Send complete" : "Sending..."}
        </h1>
        <p className="mt-3 text-sm" style={{ color: INK_SOFT }}>
          Job <span className="font-mono">{job.job_id}</span> -- {job.queued} queued
        </p>
      </header>

      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: PAPER, border: BORDER, boxShadow: `4px 4px 0 ${INK}` }}
      >
        <div className="flex items-baseline justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: INK_SOFT }}>
            Progress
          </span>
          <span className="font-black text-2xl tabular-nums" style={{ color: INK }}>
            {progress}%
          </span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(26,26,26,0.1)" }}>
          <div
            className="h-full transition-all"
            style={{ width: `${progress}%`, background: SIENNA }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Pill label="Sent" value={jobStatus?.sent ?? 0} />
          <Pill label="Failed" value={jobStatus?.failed ?? 0} />
          <Pill label="Total" value={jobStatus?.total ?? job.queued} />
        </div>
        {jobStatus?.status === "completed" && jobStatus.failed > 0 && (
          <div className="mt-6 text-xs font-mono" style={{ color: SIENNA }}>
            {jobStatus.failed} recipient{jobStatus.failed === 1 ? "" : "s"} could not be reached.
          </div>
        )}
        {jobStatus?.status === "completed" && (
          <div className="mt-6 flex gap-2">
            <Link
              href={`${ADMIN_ROUTE}/subscribers`}
              className="font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-5 rounded-full"
              style={{ background: INK, color: PAPER }}
            >
              View subscribers
            </Link>
            <button
              onClick={onReset}
              className="font-mono text-[10px] uppercase tracking-[0.3em] py-3 px-5 rounded-full cursor-pointer"
              style={{ background: PAPER, color: INK, border: BORDER }}
            >
              Compose another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
