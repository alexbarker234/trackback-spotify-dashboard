"use client";

import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
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

export default function ItemCarousel({ title, subtitle, children, className = "", viewMoreUrl }: ItemCarouselProps) {
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

    setCanScrollLeft(currentIndex > 0);
    setCanScrollRight(currentIndex < maxIndex);
  }, [children, visibleItems, currentIndex]);

  const getVisibleItemsCount = () => {
    if (!containerRef.current) return 0;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const children = container.children;

    if (children.length === 0) return 0;

    // Get the actual width of the first item
    const firstItem = children[0] as HTMLElement;
    const itemWidth = firstItem.offsetWidth;
    const gap = 12; // gap-3 = 12px

    return Math.round(containerWidth / (itemWidth + gap));
  };

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const children = container.children;

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
      {/* Header with title and controls */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">{title}</h2>
          {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
        </div>

        {/* Navigation controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed ${
              canScrollLeft
                ? "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                : "cursor-not-allowed bg-zinc-800 text-zinc-500"
            }`}
          >
            <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed ${
              canScrollRight
                ? "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                : "cursor-not-allowed bg-zinc-800 text-zinc-500"
            }`}
          >
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
          </button>
          {viewMoreUrl && (
            <Link href={viewMoreUrl} className="text-sm text-zinc-400 transition-colors hover:text-zinc-300">
              View More
            </Link>
          )}
        </div>
      </div>

      {/* Container with hidden overflow */}
      <div ref={containerRef} className="overflow-hidden">
        {/* Content with transform */}
        <div
          ref={contentRef}
          className="flex gap-3"
          style={{
            transform: "translateX(0px)",
            transition: "transform 0.3s ease-in-out"
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
