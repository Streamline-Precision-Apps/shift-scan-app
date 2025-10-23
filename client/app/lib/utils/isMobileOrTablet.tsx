export const isMobileOrTablet = () => {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as any;
  if (nav.userAgentData && typeof nav.userAgentData.mobile === "boolean") {
    return nav.userAgentData.mobile;
  }
  const ua = (
    navigator.userAgent ||
    navigator.vendor ||
    (window as any).opera ||
    ""
  ).toLowerCase();
  return /android|iphone|ipad|ipod|iemobile|blackberry|opera mini|mobile|tablet/.test(
    ua
  );
};
