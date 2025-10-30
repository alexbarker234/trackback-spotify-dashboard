"use client";

import ListenCard from "@/components/cards/ListenCard";
import { formatDuration } from "@/lib/utils/timeUtils";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Disclosure, DisclosureButton, DisclosurePanel, Transition } from "@headlessui/react";

type Listen = {
  id: string;
  durationMS: number;
  playedAt: string | Date;
  trackName: string;
  trackIsrc: string;
  imageUrl: string | null;
  trackDurationMS: number;
  artistNames: string[];
  albumName: string | null;
};

export function DayDisclosure({ date, listens }: { date: Date; listens: Listen[] }) {
  const formatted = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);

  const listensCount = listens.length;
  const timeListened = listens.reduce((acc, listen) => acc + listen.durationMS, 0);

  return (
    <Disclosure>
      {({ open }) => (
        <div className="rounded-2xl bg-white/5">
          <DisclosureButton className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-left text-zinc-100 transition hover:bg-white/10">
            <div className="flex flex-col gap-2">
              <span className="text-lg font-semibold">{formatted}</span>
              <span className="text-sm text-zinc-400">
                {listensCount} listens • {formatDuration(timeListened)}
              </span>
            </div>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`h-5 w-5 transition-transform ${open ? "rotate-180" : "rotate-0"}`}
            />
          </DisclosureButton>
          <Transition
            enter="transition duration-150 ease-out"
            enterFrom="transform scale-y-95 opacity-0"
            enterTo="transform scale-y-100 opacity-100"
            leave="transition duration-100 ease-in"
            leaveFrom="transform scale-y-100 opacity-100"
            leaveTo="transform scale-y-95 opacity-0"
          >
            <DisclosurePanel className="px-2 pb-2">
              <div className="space-y-3">
                {listens.map((l) => (
                  <ListenCard
                    key={l.id}
                    listen={{
                      ...l,
                      playedAt: typeof l.playedAt === "string" ? new Date(l.playedAt) : l.playedAt
                    }}
                  />
                ))}
              </div>
            </DisclosurePanel>
          </Transition>
        </div>
      )}
    </Disclosure>
  );
}
