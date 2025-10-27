"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// Type definition for the fetch function that will be provided by the user
// Takes skip (pagination offset) and optional reset flag, returns promise of data array
type FetchFunction<T> = (skip: number, reset?: boolean) => Promise<T[]>;

// Configuration options for the hook
interface UseInfiniteScrollOptions<T> {
  initialData?: T[]; // Initial data to populate before first fetch
  initialSkip?: number; // Starting point for pagination
  take?: number; // Number of items to fetch per request (page size)
  fetchFn: FetchFunction<T>; // User-provided fetch function
  dependencies?: unknown[]; // When these change, the data will reset
}

export function useInfiniteScroll<T>({
  initialData = [],
  initialSkip = 0,
  take = 10,
  fetchFn,
  dependencies = [],
}: UseInfiniteScrollOptions<T>) {
  // STATE MANAGEMENT
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<T[]>(initialData); // The accumulated data
  const [skip, setSkip] = useState(initialSkip); // Current pagination offset
  const [hasMore, setHasMore] = useState(true); // Flag if more data is available
  const [isLoading, setIsLoading] = useState(false); // Loading state for additional pages
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Initial load state

  // INTERSECTION OBSERVER
  const observer = useRef<IntersectionObserver | null>(null); // Observer instance ref

  // DATA FETCHING LOGIC
  const fetchData = useCallback(
    async (currentSkip: number, reset = false) => {
      try {
        if (reset) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const newData = await fetchFn(currentSkip, reset);

        // Update data based on whether this is a reset or append operation
        if (newData.length > 0) {
          setData((prev) => (reset ? newData : [...prev, ...newData]));
          setSkip(currentSkip + take); // Update pagination offset
        }

        // Determine if we've reached the end of available data
        if (newData.length < take) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error as Error);
      } finally {
        // Reset loading states
        setIsLoading(false);
        setIsRefreshing(false);
        setIsInitialLoading(false);
      }
    },
    [fetchFn, take] // Dependencies for useCallback
  );

  // RESET LOGIC WHEN DEPENDENCIES CHANGE
  useEffect(() => {
    // Clear existing data and reset to initial state
    setData([]);
    setSkip(0);
    setHasMore(true);
    setIsInitialLoading(true);

    // Trigger fresh data fetch
    fetchData(0, true);

    // Cleanup function - disconnect observer if it exists
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [...dependencies]); // Runs when dependencies array changes

  // INTERSECTION OBSERVER CALLBACK
  const lastItemRef = useCallback(
    (node: HTMLElement | null) => {
      // Don't proceed if:
      // - No node exists
      // - Already loading
      // - No more data to load
      if (!node || isLoading || !hasMore) return;

      // Disconnect any existing observer
      if (observer.current) observer.current.disconnect();

      // Create new observer
      observer.current = new IntersectionObserver((entries) => {
        // If the observed element is intersecting (visible in viewport)
        // and we're not currently loading, and there's more data available
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchData(skip); // Trigger data fetch
        }
      });

      // Start observing the node
      observer.current.observe(node);
    },
    [isLoading, hasMore, skip, fetchData] // Dependencies for useCallback
  );

  const refresh = useCallback(async () => {
    await fetchData(0, true);
  }, [fetchData]);

  // RETURN VALUES FOR COMPONENTS TO USE
  return {
    data, // The accumulated data array
    setData, // Function to set the data
    isLoading, // Whether additional data is being loaded
    isInitialLoading, // Whether initial data is being loaded
    isRefreshing, // Whether a refresh is in progress
    hasMore, // Whether more data is available to load
    lastItemRef, // Ref callback to attach to the last item in your list
    refresh,
    reset: () => {
      // Manual reset function
      setData([]);
      setSkip(0);
      setHasMore(true);
      setIsInitialLoading(true);
      fetchData(0, true);
    },
  };
}

//--------------------------------------------------------------------
// Example Usage of useInfiniteScroll  -----
/*
const fetchPosts = async (skip: number) => {
  const res = await fetch(`/api/posts?skip=${skip}`);
  return res.json();
};

const { data, isLoading, lastItemRef } = useInfiniteScroll<Post>({
  fetchFn: fetchPosts,
  dependencies: [categoryFilter], // resets when filter changes
});

// In your render:
{data.map((post, index) => (
  <PostItem 
    key={post.id} 
    ref={index === data.length - 1 ? lastItemRef : null}
    {...post}
  />
))}
  
*/
