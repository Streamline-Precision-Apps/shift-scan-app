import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Bell,
  Clock,
  FileText,
  Box,
  AlertTriangle,
  Loader2,
  ClockAlert,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserTopicPreferences } from "@/actions/NotificationActions";
import { useFcmContext } from "./FcmContext";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

// Define available notification topics with user-friendly names and icons
const AVAILABLE_TOPICS = [
  {
    id: "timecard-submission",
    title: "Pending Timecard Approvals",
    desc: "Get notified when team members submit timecards that require your approval.",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    id: "form-submissions",
    title: "Pending Form Submissions",
    desc: "Be alerted when forms are submitted and waiting for review.",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "items",
    title: "New Item Approval Requests",
    desc: "Receive alerts when new items are submitted and need review.",
    icon: <Box className="w-4 h-4" />,
  },
  {
    id: "timecards-changes",
    title: "A Timecard was Modified",
    desc: "Be alerted when timecards are modified and require your attention.",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    id: "equipment-break",
    title: "Broken Equipment Reported ",
    desc: "Be alerted when equipment is reported broken and requires your attention.",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
];

export default function NotificationModal({ open, setOpen }: Props) {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const { token, notificationPermissionStatus } = useFcmContext();
  // Simplified state - either we're showing settings or we have a permission issue
  const [showPermissionOverlay, setShowPermissionOverlay] = useState(false);
  const [permissionType, setPermissionType] = useState<"blocked" | "needed">(
    "needed",
  );

  // Load current preferences
  useEffect(() => {
    // Skip effect if modal is not open
    if (!open) return;

    // Track if the component is still mounted
    let isMounted = true;

    async function loadPreferences() {
      // Always set to loading first
      setIsDataLoading(true);
      // Hide permission overlay during loading
      setShowPermissionOverlay(false);

      try {
        // Wait for permission status to be fully determined
        // This ensures we don't flash different UI states
        if (notificationPermissionStatus === undefined) {
          // Wait for the hook to fully initialize
          return;
        }

        // 1 second delay helps load in the hook
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Handle different permission states
        if (notificationPermissionStatus === "denied") {
          if (isMounted) {
            setPermissionType("blocked");
            setShowPermissionOverlay(true);
            setIsDataLoading(false);
          }
          return;
        }

        if (!token) {
          if (isMounted) {
            setPermissionType("needed");
            setShowPermissionOverlay(true);
            setIsDataLoading(false);
          }
          return;
        }

        // We have permission and token, load preferences
        const userPrefs = await getUserTopicPreferences();

        if (!isMounted) return;

        // No permission issues, hide overlay
        setShowPermissionOverlay(false);

        // Convert the array of topics to a record of topicId: true
        const prefsRecord: Record<string, boolean> = {};
        AVAILABLE_TOPICS.forEach((topic) => {
          prefsRecord[topic.id] = userPrefs.some(
            (pref) => pref.topic === topic.id,
          );
        });

        setPreferences(prefsRecord);
      } catch (error) {
        if (!isMounted) return;
        console.error("Error loading preferences:", error);
        toast.error("Failed to load notification preferences");
      } finally {
        // Only update loading state if component is still mounted
        if (isMounted) {
          setIsDataLoading(false);
        }
      }
    }

    // Start the loading process
    loadPreferences();

    // Cleanup function
    return () => {
      isMounted = false;
      setIsDataLoading(true); // Reset to loading for next open
      setShowPermissionOverlay(false); // Reset overlay state
    };
  }, [open, token, notificationPermissionStatus]);

  // Toggle a topic subscription
  const toggleTopic = (topicId: string) => {
    setPreferences((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  // Save preferences to server
  const handleSave = async () => {
    if (!token) {
      console.log("Saving failed, no token available");

      toast.error("You need to allow notifications to save preferences");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Saving notification preferences1");
      // Get topics to subscribe to (enabled preferences)
      const topicsToSubscribe = Object.entries(preferences)
        .filter(([_, enabled]) => enabled)
        .map(([topic]) => topic);
      console.log("Saving notification preferences2");

      // Get topics to unsubscribe from (disabled preferences)
      const userPrefs = await getUserTopicPreferences();

      console.log("Current user prefs:", userPrefs); // Debug log
      console.log("Topics to subscribe:", topicsToSubscribe); // Debug log

      const currentTopics = userPrefs.map((pref) => pref.topic);
      const topicsToUnsubscribe = currentTopics.filter(
        (topic) => !topicsToSubscribe.includes(topic),
      );
      // First, handle subscriptions if there are any
      if (topicsToSubscribe.length > 0) {
        const subscribeResponse = await fetch("/api/notifications/topics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "subscribe",
            topics: topicsToSubscribe,
            token,
            // userId: "session-user", // The API will get the actual userId from the session
          }),
        });

        if (!subscribeResponse.ok) {
          throw new Error(`Error: ${subscribeResponse.statusText}`);
        }
      }

      // Then, handle un-subscriptions if there are any
      if (topicsToUnsubscribe.length > 0) {
        const unsubscribeResponse = await fetch("/api/notifications/topics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "unsubscribe",
            topics: topicsToUnsubscribe,
            token,
            // userId: "session-user", // The API will get the actual userId from the session
          }),
        });

        if (!unsubscribeResponse.ok) {
          throw new Error(`Error: ${unsubscribeResponse.statusText}`);
        }
      }

      toast.success("Notification preferences saved");
      setOpen(false);
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save notification preferences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[90%] max-w-2xl min-h-[420px] rounded-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Bell className="h-5 w-5" />
              Notification Settings
            </DialogTitle>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose which notifications you&apos;d like to receive
          </p>
        </DialogHeader>

        {/* Global loading overlay when first loading */}
        {isDataLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 z-20 p-6 rounded-lg">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground text-center">
              Loading notification settings...
            </p>
          </div>
        )}

        {/* Combined permission overlay */}
        {showPermissionOverlay && !isDataLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 z-10 p-6 rounded-lg">
            {permissionType === "blocked" ? (
              <>
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Notifications Blocked
                </h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Notifications are blocked in your browser settings. Please
                  enable them to receive alerts about important events.
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => {
                      // Open browser settings instructions
                      const isChrome =
                        navigator.userAgent.indexOf("Chrome") > -1;
                      const isFirefox =
                        navigator.userAgent.indexOf("Firefox") > -1;
                      const isSafari =
                        navigator.userAgent.indexOf("Safari") > -1 && !isChrome;

                      let instructions = "";
                      if (isChrome) {
                        instructions =
                          "Click on the lock icon in the address bar → Site settings → Notifications → Allow";
                      } else if (isFirefox) {
                        instructions =
                          "Click on the lock icon in the address bar → Connection secure → More information → Permissions → Notifications → Allow";
                      } else if (isSafari) {
                        instructions =
                          "Go to Safari Preferences → Websites → Notifications → Find this website and select 'Allow'";
                      } else {
                        instructions =
                          "Please check your browser settings to enable notifications for this site";
                      }

                      toast.info("How to enable notifications", {
                        description: instructions,
                        duration: 10000,
                      });
                    }}
                  >
                    Show Me How
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(
                        "https://support.google.com/chrome/answer/3220216?hl=en",
                        "_blank",
                      );
                    }}
                  >
                    Learn More About Notifications
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Enable Notifications
                </h3>
                <p className="text-muted-foreground mb-4 text-center">
                  Allow notifications to stay updated on important events.
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={async () => {
                      try {
                        setIsDataLoading(true);
                        // Request permission
                        const permission =
                          await Notification.requestPermission();
                        if (permission === "granted") {
                          // Reload the page to trigger FCM token generation
                          window.location.reload();
                        } else {
                          // Still denied, show appropriate message
                          setPermissionType(
                            permission === "denied" ? "blocked" : "needed",
                          );
                          setIsDataLoading(false);
                        }
                      } catch (error) {
                        console.error("Error requesting permission:", error);
                        toast.error(
                          "Unable to request notification permission",
                        );
                        setIsDataLoading(false);
                      }
                    }}
                  >
                    Enable Notifications
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    Maybe Later
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Always render the settings UI, but with skeletons when loading */}
        <div className="space-y-4 mt-2">
          {AVAILABLE_TOPICS.map((topic) => (
            <div
              key={topic.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-md bg-muted">
                  {topic.icon}
                </div>
                <div>
                  <Label htmlFor={`topic-${topic.id}`} className="font-medium">
                    {topic.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">{topic.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-16">
                {isDataLoading ? (
                  <Skeleton className="h-5 w-10" />
                ) : (
                  <Switch
                    id={`topic-${topic.id}`}
                    checked={preferences[topic.id] || false}
                    onCheckedChange={() => toggleTopic(topic.id)}
                    disabled={!token}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex items-center justify-end gap-3 mt-4">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isLoading || !token}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
