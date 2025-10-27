import { useCallback, useEffect, useRef } from "react";
import { debounce } from "lodash";

export const useAutoSave = <T>(
  saveFunction: (data: T) => Promise<void>,
  delay: number
) => {
  const debouncedSaveRef = useRef(
    debounce((data: T) => saveFunction(data), delay)
  );

  // Add a cancel method
  const cancel = useCallback(() => {
    debouncedSaveRef.current.cancel();
  }, []);

  // Update the debounced function when dependencies change
  useEffect(() => {
    debouncedSaveRef.current = debounce((data: T) => saveFunction(data), delay);
  }, [saveFunction, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSaveRef.current.cancel();
    };
  }, []);

  return {
    autoSave: debouncedSaveRef.current,
    cancel,
  };
};

// export const useAutoSave = <T>(
//   saveFunction: (data: T) => Promise<void>,
//   delay: number
// ) => {
//   const debouncedSave = useCallback(
//     debounce((data: T) => saveFunction(data), delay),
//     [saveFunction, delay]
//   );

//   useEffect(() => {
//     return () => {
//       debouncedSave.cancel();
//     };
//   }, [debouncedSave]);

//   return debouncedSave;
// };
