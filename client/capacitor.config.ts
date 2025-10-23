import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.shiftscanapp",
  appName: "Shift Scan",
  webDir: "out",
  server: {
    url: "http://192.168.1.102:3000",
    cleartext: true,
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;
