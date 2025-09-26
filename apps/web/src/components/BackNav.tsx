"use client";

import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";

export default function BackNav() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-4 flex cursor-pointer items-center gap-2 text-zinc-400 transition-colors hover:text-zinc-100"
    >
      <FontAwesomeIcon icon={faArrowLeft} />
      Back
    </button>
  );
}
