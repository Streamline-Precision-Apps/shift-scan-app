"use client";
import "@/app/globals.css";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export default function PayrollQrLandingPage() {
  return (
    <main className="relative min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-app-dark-blue via-app-blue to-app-blue px-2 md:px-8 py-0 flex flex-col items-center justify-center">
      {/* Animated Gradient Background Overlay */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-app-dark-blue via-app-blue to-app-blue animate-gradient-move opacity-80" />
        <div className="absolute left-1/2 top-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-app-blue opacity-20 rounded-full blur-3xl" />
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-app-blue opacity-10 rounded-full blur-2xl" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center py-8 md:py-20 max-h-full overflow-y-auto">
        <img
          src="/windows11/StoreLogo.scale-400.png"
          alt="Shift Scan Store Logo"
          className="h-32 md:h-56 w-auto mb-6 mt-2 drop-shadow-2xl rounded-2xl bg-white bg-opacity-90 border-4 border-white shadow-lg animate-fade-in"
          style={{ maxWidth: "220px", height: "auto", objectFit: "contain" }}
        />
        <h1 className="text-3xl md:text-6xl font-extrabold text-white text-center mb-3 drop-shadow-lg animate-fade-in">
          Payroll Made Simple
        </h1>
        <h2 className="text-xl md:text-3xl font-bold text-app-dark-blue text-center mb-4 animate-fade-in delay-100">
          with QR Technology
        </h2>
        <p className="text-base md:text-xl text-white text-center mb-6 max-w-xs md:max-w-2xl animate-fade-in delay-200">
          <span className="font-semibold text-app-dark-blue">
            Revolutionize your workforce management and payroll
          </span>{" "}
          with instant, secure, and verifiable timekeeping—powered by QR codes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in delay-300 relative w-full max-w-xs sm:max-w-none justify-center items-stretch">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="relative bg-app-dark-blue hover:bg-app-dark-blue/80 text-white font-bold py-3 px-8 rounded-xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-app-blue cursor-pointer"
                type="button"
              >
                Start Free Trial
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" sideOffset={8} className="text-center">
              <span className="block text-app-dark-blue font-semibold mb-1">
                Coming Soon
              </span>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="relative bg-white hover:bg-gray-100 text-app-dark-blue font-bold py-3 px-8 rounded-xl shadow-lg text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-app-blue cursor-pointer"
                type="button"
              >
                Book a Demo
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" sideOffset={8} className="text-center">
              <span className="block text-app-dark-blue font-semibold mb-1">
                Coming Soon
              </span>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-row gap-2 justify-center animate-fade-in delay-400">
          <span className="text-white/80 text-sm">Get started in minutes</span>
        </div>
        <div className="mt-3 animate-fade-in delay-500">
          <span className="text-white/70 text-sm">Already a member?</span>
          <a
            href="/signin"
            className="ml-2 text-app-dark-blue hover:text-app-dark-blue/80 font-semibold underline underline-offset-2 transition"
          >
            Sign In
          </a>
        </div>
      </section>
    </main>
  );
}
