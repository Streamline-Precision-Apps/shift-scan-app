"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fieldTypes } from "../../types";

interface FormBuilderPanelRightProps {
  addField: (fieldType: string) => void;
}

export const FormBuilderPanelRight: React.FC<FormBuilderPanelRightProps> = ({
  addField,
}) => {
  return (
    <div className="flex flex-col min-w-[250px] w-1/5 h-full col-span-1 bg-white  rounded-tr-lg rounded-br-lg">
      {/* Field Types Header - Fixed */}
      <div className="h-full max-h-[60px] w-full ">
        <div className="bg-muted border-b border-slate-200 flex flex-row gap-x-4 w-full justify-center  items-center p-1 rounded-tr-lg">
          <div className="flex flex-col">
            <p className="text-sm font-bold">Field Library</p>
            <p className="text-xs text-gray-600">
              Choose a field type to add it to your form.
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Field Types Section */}
      <div className="flex flex-col h-full bg-white px-3 py-2 rounded-br-lg overflow-y-auto ">
        {[...fieldTypes]
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((fieldType) => (
            <button
              key={fieldType.name}
              onClick={() => addField(fieldType.name)}
              className="flex flex-row items-center p-2 mb-2 rounded-md hover:shadow-md transition-shadow duration-200 hover:bg-gray-50 w-full"
            >
              <div
                className={`w-8 h-8 mr-3 rounded-sm ${fieldType.color} flex items-center justify-center`}
              >
                <img
                  src={fieldType.icon}
                  alt={fieldType.label}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex flex-col text-left">
                <p className="text-sm font-semibold">{fieldType.label}</p>
                <p className="text-xs text-gray-400">{fieldType.description}</p>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};
