"use client";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faArrowLeft, faExclamationTriangle, faHome, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "./Button";

export interface ErrorPageProps {
  icon?: IconDefinition;
  iconBgColor?: string;
  iconColor?: string;
  title?: string;
  subtitle?: string;
  message?: string;
  showTryAgain?: boolean;
  showGoHome?: boolean;
  showGoBack?: boolean;
  onReset?: () => void;
  fullScreen?: boolean;
}

export default function ErrorPage({
  icon = faExclamationTriangle,
  iconBgColor = "bg-gradient-to-br from-red-500/10 to-pink-500/10",
  iconColor = "text-red-400",
  title = "Something went wrong!",
  subtitle = "An error occurred",
  message = "We're sorry, but something unexpected happened. Try refreshing the page.",
  showTryAgain = true,
  showGoHome = true,
  showGoBack = false,
  onReset,
  fullScreen = false
}: ErrorPageProps) {
  const containerClass = fullScreen
    ? "flex min-h-screen items-center justify-center px-4"
    : "flex flex-grow items-center justify-center px-4";

  return (
    <div className={containerClass}>
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mb-8">
          <div
            className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full backdrop-blur-sm ${iconBgColor}`}
          >
            <FontAwesomeIcon icon={icon} className={`text-4xl ${iconColor}`} />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">{title}</h1>
          <h2 className="mb-4 text-xl font-semibold text-gray-300">{subtitle}</h2>
        </div>

        {/* Message */}
        <div className="mb-8">
          <p className="mb-4 leading-relaxed text-gray-400">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {(() => {
            const buttons = [];
            let buttonCount = 0;

            if (showTryAgain && onReset) {
              buttons.push(
                <Button
                  key="try-again"
                  onClick={onReset}
                  variant={buttonCount === 0 ? "primary" : "secondary"}
                  className="w-full py-3 font-medium"
                  icon={faSyncAlt}
                  label="Try Again"
                />
              );
              buttonCount++;
            }

            if (showGoHome) {
              buttons.push(
                <Button
                  key="go-home"
                  href="/"
                  variant={buttonCount === 0 ? "primary" : "secondary"}
                  className="w-full py-3 font-medium"
                  icon={faHome}
                  label="Go Home"
                />
              );
              buttonCount++;
            }

            if (showGoBack) {
              buttons.push(
                <Button
                  key="go-back"
                  onClick={() => window.history.back()}
                  variant={buttonCount === 0 ? "primary" : "secondary"}
                  className="w-full py-3 font-medium"
                  icon={faArrowLeft}
                  label="Go Back"
                />
              );
              buttonCount++;
            }

            return buttons;
          })()}
        </div>
      </div>
    </div>
  );
}
