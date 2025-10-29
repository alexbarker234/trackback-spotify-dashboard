"use client";

import { faChevronLeft, faChevronRight, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";

interface ItemCarouselProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  viewMoreUrl?: string;
}

export default function ItemCarousel({
  title,
  subtitle,
  children,
  className = "",
  viewMoreUrl
}: ItemCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);
  const [visibleItems, setVisibleItems] = useState(0);

  const updateButtonStates = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const totalItems = React.Children.count(children);
    const maxIndex = Math.max(0, totalItems - visibleItems);

    console.log(totalItems, visibleItems);

    setCanScrollLeft(currentIndex > 0);
    setCanScrollRight(currentIndex < maxIndex);
    console.log(currentIndex, maxIndex);
  }, [children, visibleItems, currentIndex]);

  const getVisibleItemsCount = () => {
    if (!containerRef.current || !contentRef.current) return 0;

    const containerWidth = containerRef.current.clientWidth;
    const children = contentRef.current.children;

    if (children.length === 0) return 0;

    // Get the actual width of the first item
    const firstItem = children[0] as HTMLElement;
    const itemWidth = firstItem.offsetWidth;
    const gap = 12;

    return Math.round(containerWidth / (itemWidth + gap));
  };

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const children = contentRef.current.children;

    if (children.length === 0) return;

    // Calculate item width and visible items
    const firstItem = children[0] as HTMLElement;
    const itemWidth = firstItem.offsetWidth;
    const visibleItems = getVisibleItemsCount();

    setItemWidth(itemWidth);
    setVisibleItems(visibleItems);
    updateButtonStates();

    // Handle window resize
    const handleResize = () => {
      const newVisibleItems = getVisibleItemsCount();
      setVisibleItems(newVisibleItems);
      updateButtonStates();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [children, currentIndex, updateButtonStates]);

  const scrollToIndex = (newIndex: number) => {
    if (!contentRef.current) return;

    const totalItems = React.Children.count(children);
    const maxIndex = Math.max(0, totalItems - visibleItems);
    const clampedIndex = Math.max(0, Math.min(newIndex, maxIndex));

    setCurrentIndex(clampedIndex);

    const gap = 12; // gap-3 = 12px
    const translateX = -(clampedIndex * (itemWidth + gap));

    contentRef.current.style.transform = `translateX(${translateX}px)`;
    contentRef.current.style.transition = "transform 0.3s ease-in-out";

    updateButtonStates();
  };

  const scrollLeft = () => {
    scrollToIndex(currentIndex - visibleItems);
  };

  const scrollRight = () => {
    scrollToIndex(currentIndex + visibleItems);
  };

  return (
    <div className={`relative h-fit ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>

        {/* Navigation controls */}
        <div className="flex flex-shrink-0 items-center space-x-2">
          <div className="hidden items-center space-x-2 sm:flex">
            <RoundedIconButton
              icon={faChevronLeft}
              onClick={scrollLeft}
              disabled={!canScrollLeft}
            />
            <RoundedIconButton
              icon={faChevronRight}
              onClick={scrollRight}
              disabled={!canScrollRight}
            />
          </div>
          {viewMoreUrl && (
            <Link
              href={viewMoreUrl}
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              View More
            </Link>
          )}
        </div>
      </div>

      <div ref={containerRef} className="overflow-scroll sm:overflow-hidden">
        <div
          ref={contentRef}
          className="flex gap-3"
          style={{
            transform: "translateX(0px)",
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function RoundedIconButton({
  icon,
  onClick,
  disabled
}: {
  icon: IconDefinition;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all disabled:cursor-not-allowed ${
        disabled ? "bg-white/5 text-gray-500" : "bg-white/10 text-white hover:bg-white/20"
      }`}
    >
      <FontAwesomeIcon icon={icon} className="h-4 w-4" />
    </button>
  );
}
