"use client";

import { useState } from "react";
import {
  Scan,
  User,
  Clock,
  Users,
  Home,
  FileText,
  Package,
} from "lucide-react";

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    { id: "timeline", label: "Timeline", icon: Clock },
    { id: "personnel", label: "Personnel", icon: Users },
    { id: "home", label: "Home", icon: Home },
    { id: "forms", label: "Forms", icon: FileText },
    { id: "assets", label: "Assets", icon: Package },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "timeline":
        return (
          <div className="text-center py-8">
            <Clock className="h-20 w-20 mx-auto text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Timeline
            </h2>
          </div>
        );
      case "personnel":
        return (
          <div className="text-center py-8">
            <Users className="h-20 w-20 mx-auto text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Personnel
            </h2>
          </div>
        );
      case "forms":
        return (
          <div className="text-center py-8">
            <FileText className="h-20 w-20 mx-auto text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Forms
            </h2>
          </div>
        );
      case "assets":
        return (
          <div className="text-center py-8">
            <Package className="h-20 w-20 mx-auto text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Assets
            </h2>
          </div>
        );
      default: // home
        return (
          <div className="text-center py-8">
            <Home className="h-20 w-20 mx-auto text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Home
            </h2>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0  bg-blue-600 text-white p-4 shadow-lg z-50">
        <div className="flex items-center justify-between ">
          <div className="flex items-center">
            <Scan className="h-8 w-8 mr-2" />
            <h1 className="text-xl font-bold">Shift Scan</h1>
          </div>
          <User className="h-6 w-6" />
        </div>
      </header>

      {/* Scrollable Main Content */}
      <main className="flex-1  overflow-y-auto pt-20 pb-20 p-4 space-y-4">
        {renderContent()}
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0  bg-white  dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 z-50">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
