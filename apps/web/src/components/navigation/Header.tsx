import { auth } from "@/lib/auth";
import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { headers } from "next/headers";
import Link from "next/link";
import { Fragment } from "react";
import LogoSvg from "../LogoSvg";
import UserProfile from "../UserProfile";
import StandaloneHeader from "./StandaloneHeader";

interface NavigationLink {
  href: string;
  text: string;
}

const navigationLinks: NavigationLink[] = [
  { href: "/dashboard", text: "Dashboard" },
  { href: "/dashboard/misc", text: "Misc" },
  { href: "/dashboard/top", text: "Top" },
  { href: "/dashboard/search", text: "Search" }
];

function MobileNavigationItem({ href, text }: NavigationLink) {
  return (
    <Link
      href={href}
      className="flex w-full rounded-lg px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-white/10"
    >
      {text}
    </Link>
  );
}

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const isStandalone = await getStandaloneCookieServer();

  if (isStandalone) {
    return <StandaloneHeader user={session?.user} />;
  }

  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="group hidden text-xl font-bold transition-opacity hover:opacity-50 md:block"
          >
            <LogoSvg className="inline-block h-8 w-8 fill-white" /> Trackback
          </Link>

          {session?.user && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden h-full items-center space-x-4 md:flex">
                {navigationLinks.map((link) => (
                  <HeaderLink key={link.href} href={link.href} text={link.text} />
                ))}
              </div>
              {/* Mobile Navigation */}
              <div className="md:hidden">
                <Menu as="div" className="relative inline-block text-left">
                  <MenuButton className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white transition-colors hover:bg-white/10 focus:outline-none">
                    <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
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
                      anchor="bottom end"
                      className="mt-2 w-48 rounded-lg bg-white/3 shadow-lg backdrop-blur-lg focus:outline-none"
                      modal={false}
                    >
                      {navigationLinks.map((link) => (
                        <MenuItem key={link.href}>
                          <MobileNavigationItem href={link.href} text={link.text} />
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Transition>
                </Menu>
              </div>

              {/* User Profile */}
              <UserProfile
                userInfo={{
                  username: session.user.name,
                  avatarURL: session.user.image
                }}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const HeaderLink = ({ href, text }: { href: string; text: string }) => {
  return (
    <Link
      href={href}
      className="flex h-full w-28 flex-col justify-center text-center text-white hover:bg-white/10"
    >
      <p>{text}</p>
    </Link>
  );
};
