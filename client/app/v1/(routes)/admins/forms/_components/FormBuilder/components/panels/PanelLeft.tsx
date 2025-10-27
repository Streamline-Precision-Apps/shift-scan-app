"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormSettings, FormField, fieldTypes } from "../../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FormTemplateCategory } from "../../../../../../../../../prisma/generated/prisma/client";

interface FormEditorPanelLeftProps {
  formSettings: FormSettings;
  formFields: FormField[];
  updateFormSettings: (
    key: keyof FormSettings,
    value: string | boolean,
  ) => void;
}

export const PanelLeft: React.FC<FormEditorPanelLeftProps> = ({
  formSettings,
  formFields,
  updateFormSettings,
}) => {
  return (
    <div className="flex flex-col col-span-1 min-w-[250px] w-1/5 h-full bg-white  rounded-tl-lg rounded-bl-lg ">
      <Tabs
        defaultValue="settings"
        className="w-full h-full flex flex-col bg-white rounded-tl-lg rounded-bl-lg p-1"
      >
        <TabsList className="w-full rounded-xl">
          <TabsTrigger
            value="settings"
            className="w-full text-xs data-[state=inactive]:text-black data-[state=active]:bg-white py-1 "
          >
            Settings
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="w-full text-xs data-[state=inactive]:text-black data-[state=active]:bg-white py-1 "
          >
            Preview
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="settings"
          className="bg-white flex-1 overflow-y-auto no-scrollbar pb-[500px] px-4 rounded-lg"
        >
          <div className="flex flex-col mt-4">
            <Label htmlFor="name" className="text-xs">
              Form Name <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formSettings.name}
              onChange={(e) => updateFormSettings("name", e.target.value)}
              placeholder="Enter Form Name"
              className="bg-white rounded-lg text-xs"
            />
            {!formSettings.name.trim() && (
              <span className="mt-1 text-xs text-red-500">Required</span>
            )}
          </div>
          <div className=" w-full mt-4">
            <Label htmlFor="description" className="text-xs">
              Description
            </Label>
            <Textarea
              placeholder="Describe the purpose of this form"
              id="description"
              value={formSettings.description}
              onChange={(e) =>
                updateFormSettings("description", e.target.value)
              }
              rows={5}
              maxLength={200}
              className="bg-white rounded-lg text-xs "
            />
          </div>
          <div className=" w-full mt-4">
            <Label htmlFor="category" className="text-xs">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              name="category"
              value={formSettings.formType}
              onValueChange={(value) => updateFormSettings("formType", value)}
            >
              <SelectTrigger className="w-full bg-white rounded-lg text-xs">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(FormTemplateCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0) + category.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!formSettings.formType && (
              <span className="mt-1 text-xs text-red-500">Required</span>
            )}
          </div>
          <div className=" w-full mt-4">
            <Label htmlFor="status" className="text-xs">
              Status <span className="text-red-500">*</span>
            </Label>
            <Select
              name="status"
              value={formSettings.isActive}
              onValueChange={(value) => updateFormSettings("isActive", value)}
            >
              <SelectTrigger className="w-full bg-white rounded-lg text-xs">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
            {!formSettings.isActive && (
              <span className="mt-1 text-xs text-red-500">Required</span>
            )}
          </div>
          <div className="mt-4 w-full flex flex-row justify-between items-center ">
            <Label htmlFor="require-signature" className="text-xs">
              Requires Digital Signature
            </Label>
            <Switch
              id="require-signature"
              name="require-signature"
              checked={formSettings.requireSignature}
              onCheckedChange={(checked) =>
                updateFormSettings("requireSignature", checked)
              }
              className="bg-white  data-[state=unchecked]:bg-neutral-500 data-[state=checked]:bg-sky-400 w-10"
            />
          </div>
          <div className="mt-4 w-full flex flex-row justify-between items-center ">
            <Label htmlFor="require-approval" className="text-xs">
              Submission Requires Approval
            </Label>
            <Switch
              id="require-approval"
              name="require-approval"
              checked={formSettings.isApprovalRequired}
              onCheckedChange={(checked) =>
                updateFormSettings("isApprovalRequired", checked)
              }
              className="bg-white  data-[state=unchecked]:bg-neutral-500 data-[state=checked]:bg-sky-400 w-10"
            />
          </div>
        </TabsContent>
        <TabsContent
          value="preview"
          className="bg-white h-full flex-1 overflow-y-auto rounded-lg"
        >
          <div className="flex flex-col h-full ">
            <div className="w-full h-12  bg-slate-100 rounded-lg justify-between flex flex-row mb-4 ">
              <div className="w-full h-full  py-1 bg-slate-100 flex flex-col justify-center items-center rounded-lg">
                <p>{formFields.length}</p>
                <p className="text-xs font-bold">Questions</p>
              </div>
              <div className="w-full h-full  py-1 bg-slate-100 flex flex-col justify-center items-center rounded-lg">
                <p>{formFields.filter((f) => f.required).length}</p>
                <p className="text-xs font-bold">Required</p>
              </div>
            </div>
            {formFields.length === 0 ? (
              <div className="w-full h-full px-2 flex-1 overflow-y-auto justify-start items-center flex flex-col rounded-lg p-4 mt-6">
                <img
                  src="/formInspect.svg"
                  alt="Form Preview Placeholder"
                  className="w-full h-6 mb-2"
                />
                <p className="text-xs text-gray-500">No questions added yet</p>
              </div>
            ) : (
              <div className="w-full h-full px-2 flex-1 overflow-y-auto no-scrollbar  gap-3">
                <p className="text-sm font-bold pb-4">Form Structure</p>
                {formFields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`flex flex-row items-center w-full gap-1 mb-2 rounded-lg bg-slate-100 p-1  relative `}
                  >
                    <div
                      className={`flex flex-row items-center w-full gap-2 px-1   ${field.required && "mt-4"}`}
                    >
                      {field.required && (
                        <span className="bg-red-100  w-fit px-2 py-0.5  rounded-md text-red-500 flex flex-row items-center text-xs absolute left-1 top-1">
                          Required
                        </span>
                      )}

                      <div className="w-[50px]  justify-center items-center flex rounded-md gap-1">
                        <p className="text-xs font-semibold">{index + 1}.</p>
                      </div>

                      <div className="flex flex-col gap-1 w-full ">
                        {field.type !== "header" &&
                          field.type !== "paragraph" && (
                            <p className="text-xs font-medium truncate max-w-[140px] text-gray-700">
                              {field.label || "Untitled Field"}
                            </p>
                          )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex flex-row items-center  justify-start  ${(() => {
                          const typeDef = fieldTypes.find(
                            (t) => t.name === field.type,
                          );
                          return typeDef
                            ? `${typeDef.color} hover:${typeDef.color
                                .replace("bg-", "bg-")
                                .replace("400", "300")
                                .replace("500", "400")
                                .replace("200", "100")}`
                            : "bg-gray-400 hover:bg-gray-300";
                        })()} `}
                      >
                        <img
                          src={
                            fieldTypes.find((t) => t.name === field.type)?.icon
                          }
                          alt={field.type}
                          className="w-7 h-auto mx-auto "
                        />
                      </Button>
                      {field.type === "dropdown" ||
                        (field.type === "multiselect" && (
                          <p className="w-fit text-xs text-gray-500">
                            {`${field.Options?.length || 0}`}
                          </p>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
