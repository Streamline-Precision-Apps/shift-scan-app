"use client";

import { se } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  Suspense,
} from "react";

interface UserProfileContextType {
  image: string | null;
  name: string;
  role: string;
  refresh: () => Promise<void>;
  setImage: (img: string | null) => void;
  loading: boolean;
  session: Session | null; // Properly typed session from next-auth
}

// Create a cache for the user image promise
let imageCache: Promise<string | null> | null = null;
let imageData: string | null = null;

// Function to fetch user image data
const fetchUserImage = async (): Promise<string | null> => {
  if (imageData !== null) return imageData;

  if (!imageCache) {
    imageCache = fetch("/api/getUserImage")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to fetch profile picture");
        const data = await response.json();
        imageData = data.image || null;
        return imageData;
      })
      .catch((error) => {
        console.error("Error fetching profile picture:", error);
        imageData = null;
        return null;
      });
  }

  return imageCache;
};

// Component that uses Suspense for async image loading
const AsyncUserImage: React.FC<{
  onImageLoad: (img: string | null) => void;
  className?: string;
  alt?: string;
}> = ({ onImageLoad, className, alt = "profile" }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    fetchUserImage().then((img) => {
      if (mounted) {
        setImageUrl(img);
        onImageLoad(img);
      }
    });

    return () => {
      mounted = false;
    };
  }, [onImageLoad]);

  return (
    <img
      src={imageUrl || "/profileEmpty.svg"}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = "/profileEmpty.svg";
      }}
    />
  );
};

// Fallback component for Suspense
const UserImageFallback: React.FC<{ className?: string; alt?: string }> = ({
  className,
  alt = "profile",
}) => <img src="/profileEmpty.svg" alt={alt} className={className} />;

// Main UserImage component with Suspense boundary
export const UserImage: React.FC<{
  onImageLoad?: (img: string | null) => void;
  className?: string;
  alt?: string;
}> = ({ onImageLoad = () => {}, className, alt }) => (
  <Suspense fallback={<UserImageFallback className={className} alt={alt} />}>
    <AsyncUserImage onImageLoad={onImageLoad} className={className} alt={alt} />
  </Suspense>
);

// Component that uses Suspense for async name loading
const AsyncUserName: React.FC<{
  onDataLoad: (data: { name: string; role: string }) => void;
  className?: string;
  maxLength?: number;
}> = ({ onDataLoad, className = "", maxLength = 12 }) => {
  const { session, loading } = useUserProfile();
  const [displayName, setDisplayName] = useState<string>("");

  React.useEffect(() => {
    if (!loading && session?.user) {
      const name =
        session.user.firstName && session.user.lastName
          ? `${session.user.firstName} ${session.user.lastName.slice(0, 1)}`
          : "";
      const role = session.user.permission || "";

      setDisplayName(name);
      onDataLoad({ name, role });
    }
  }, [session, loading, onDataLoad]);

  const truncatedName =
    displayName.length >= maxLength
      ? displayName.slice(0, maxLength) + "..."
      : displayName;

  return (
    <div className={`justify-start text-black text-xs font-bold ${className}`}>
      {truncatedName}
    </div>
  );
};

// Component that uses Suspense for async role loading
const AsyncUserRole: React.FC<{
  onDataLoad: (data: { name: string; role: string }) => void;
  className?: string;
}> = ({ onDataLoad, className = "" }) => {
  const { session, loading } = useUserProfile();
  const [displayRole, setDisplayRole] = useState<string>("");

  React.useEffect(() => {
    if (!loading && session?.user) {
      const name =
        session.user.firstName && session.user.lastName
          ? `${session.user.firstName} ${session.user.lastName.slice(0, 1)}`
          : "";
      const role = session.user.permission || "";

      setDisplayRole(role);
      onDataLoad({ name, role });
    }
  }, [session, loading, onDataLoad]);

  return (
    <div
      className={`text-center justify-start text-neutral-400 text-[10px] font-normal ${className}`}
    >
      {displayRole}
    </div>
  );
};

// Fallback components for Suspense
const UserNameFallback: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div className={`justify-start text-black text-xs font-bold ${className}`}>
    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

const UserRoleFallback: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <div
    className={`text-center justify-start text-neutral-400 text-[10px] font-normal ${className}`}
  >
    <div className="h-2 w-16 bg-gray-200 rounded animate-pulse"></div>
  </div>
);

// Main UserName component with Suspense boundary
export const UserName: React.FC<{
  onDataLoad?: (data: { name: string; role: string }) => void;
  className?: string;
  maxLength?: number;
}> = ({ onDataLoad = () => {}, className, maxLength }) => (
  <Suspense fallback={<UserNameFallback className={className} />}>
    <AsyncUserName
      onDataLoad={onDataLoad}
      className={className}
      maxLength={maxLength}
    />
  </Suspense>
);

// Main UserRole component with Suspense boundary
export const UserRole: React.FC<{
  onDataLoad?: (data: { name: string; role: string }) => void;
  className?: string;
}> = ({ onDataLoad = () => {}, className }) => (
  <Suspense fallback={<UserRoleFallback className={className} />}>
    <AsyncUserRole onDataLoad={onDataLoad} className={className} />
  </Suspense>
);

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined,
);

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx)
    throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
};

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const { data: session, status } = useSession();

  // Set name and role only after session is loaded
  React.useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }
    if (session?.user) {
      const newName =
        session.user.firstName && session.user.lastName
          ? `${session.user.firstName} ${session.user.lastName.slice(0, 1)}`
          : "";
      const newRole = session.user.permission || "";

      setName(newName);
      setRole(newRole);
      setLoading(false);
    }
  }, [session, status]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Clear the image cache to force fresh fetch
      imageCache = null;
      imageData = null;

      const response = await fetch("/api/getUserImage");
      if (!response.ok) throw new Error("Failed to fetch profile picture");
      const data = await response.json();
      const newImage = data.image || null;

      // Update cache and state
      imageData = newImage;
      setImage(newImage);
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      imageData = null;
      setImage(null);
    } finally {
      if (status !== "loading") setLoading(false);
    }
  }, [status]);

  React.useEffect(() => {
    if (status !== "loading") refresh();
  }, [refresh, status]);

  return (
    <UserProfileContext.Provider
      value={{ image, name, role, refresh, setImage, loading, session }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};
