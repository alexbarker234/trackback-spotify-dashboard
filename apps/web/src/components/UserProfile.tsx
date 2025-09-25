"use client";

import { authClient } from "@/lib/auth-client";
import { faChevronDown, faSignOutAlt, faUser, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

interface MenuItemProps {
  href?: string;
  onClick?: () => void;
  icon: IconDefinition;
  label: string;
}

function ProfileMenuItem({ href, onClick, icon, label }: MenuItemProps) {
  const baseClasses =
    "flex items-center w-full px-4 py-2 text-sm text-zinc-200 rounded-lg transition-colors hover:bg-zinc-700 cursor-pointer";

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        <FontAwesomeIcon icon={icon} className="mr-3 h-4 w-4" />
        {label}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      <FontAwesomeIcon icon={icon} className="mr-3 h-4 w-4" />
      {label}
    </button>
  );
}

export default function UserProfile({ userInfo }: { userInfo: { username: string; avatarURL: string } }) {
  const menuItems: MenuItemProps[] = [
    { href: "/profile", icon: faUser, label: "Profile" }
    //{ href: "/settings", icon: FaCog, label: "Settings" }
  ];

  menuItems.push({
    onClick: async () => {
      await authClient.signOut();
      window.location.href = "/";
    },
    icon: faSignOutAlt,
    label: "Sign Out"
  });

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="flex cursor-pointer items-center gap-3 rounded-lg bg-zinc-800 px-3 py-2 transition-colors hover:bg-zinc-700">
        <Image
          src={userInfo.avatarURL}
          alt={userInfo.username}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full"
        />
        <span className="hidden font-medium text-zinc-100 sm:inline">{userInfo.username}</span>
        <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 text-zinc-400" />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-700 bg-zinc-800 shadow-lg focus:outline-none"
          modal={false}
        >
          <>
            {menuItems.map(({ href, onClick, icon: Icon, label }) => (
              <MenuItem key={label}>
                <ProfileMenuItem href={href} onClick={onClick} icon={Icon} label={label} />
              </MenuItem>
            ))}
          </>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
