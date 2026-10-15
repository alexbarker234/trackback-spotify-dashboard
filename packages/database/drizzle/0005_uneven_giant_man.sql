CREATE TABLE "job_state" (
	"job_id" text PRIMARY KEY NOT NULL,
	"next_run_at" timestamp with time zone NOT NULL,
	"locked_until" timestamp with time zone,
	"lock_token" text,
	"locked_at" timestamp with time zone,
	"last_finished_at" timestamp with time zone,
	"last_error" text,
	"run_requested_at" timestamp with time zone,
	"completed_at" timestamp with time zone
);
