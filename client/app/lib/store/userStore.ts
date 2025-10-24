import { create } from "zustand";

type Contact = {
  id: string;
  userId: string;
  phoneNumber: string;
  emergencyContact: string;
  emergencyContactNumber: string;
  createdAt: string;
  updatedAt: string;
};

type UserSettings = {
  id: string;
  userId: string;
  language: string;
  generalReminders: boolean;
  personalReminders: boolean;
  cameraAccess: boolean;
  locationAccess: boolean;
  cookiesAccess: boolean;
  createdAt: string;
  lastUpdated: string;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  signature: string;
  DOB: string;
  truckView: boolean;
  tascoView: boolean;
  laborView: boolean;
  mechanicView: boolean;
  permission: string;
  image: string;
  terminationDate: string | null;
  accountSetup: boolean;
  clockedIn: boolean;
  companyId: string;
  middleName: string | null;
  secondLastName: string | null;
  lastSeen: string;
  accountSetupToken: any;
  Contact: Contact;
  UserSettings: UserSettings;
};

type UserStore = {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLanguage: (language: string) => void;
  setUserSettings: (settings: Partial<UserSettings>) => void;
  setImage: (image: string) => void;
};

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setLanguage: (language) => {
    const user = get().user;
    if (user) {
      set({
        user: { ...user, UserSettings: { ...user.UserSettings, language } },
      });
    }
  },
  setUserSettings: (settings) => {
    const user = get().user;
    if (user) {
      set({
        user: {
          ...user,
          UserSettings: { ...user.UserSettings, ...settings },
        },
      });
    }
  },
  setImage: (image) => {
    const user = get().user;
    if (user) {
      set({
        user: {
          ...user,
          image,
        },
      });
    }
  },
}));
