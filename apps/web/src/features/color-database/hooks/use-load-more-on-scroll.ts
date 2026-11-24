import { useEffect, useRef } from "react";

export function useLoadMoreOnScroll({
  hasMore,
  isLoading,
  loadMore,
  loadedCount,
}: {
  hasMore: boolean;
  isLoading: boolean;
  loadMore: () => void;
  loadedCount: number;
}) {
  const bottomMarkerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marker = bottomMarkerRef.current;
    if (!marker || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !isLoading) loadMore();
    });
    observer.observe(marker);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore, loadedCount]);

  return bottomMarkerRef;
}
