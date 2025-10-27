"use client";
import { Buttons } from "@/components/(reusable)/buttons";
import { Holds } from "@/components/(reusable)/holds";
import { Titles } from "@/components/(reusable)/titles";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Spinner from "@/components/(animations)/spinner";

export function ViewDocumentContent({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid document ID");
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/getDocumentById/${id}`, {
          headers: {
            Accept: "application/pdf",
          },
        });

        if (!response.ok) {
          console.error("Fetch error:", response.status, response.statusText);
          const errorData = await response.text();
          try {
            const jsonError = JSON.parse(errorData);
            throw new Error(jsonError.error || "Failed to fetch document");
          } catch {
            throw new Error(errorData || "Failed to fetch document");
          }
        }

        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error("Received empty PDF file");
        }

        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error("Fetch document error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load document",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();

    return () => {
      if (pdfUrl) {
        // Delay revocation to avoid revoking while being used
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 3000);
      }
    };
  }, [id]);

  if (loading) {
    return (
      <Holds className="row-span-full flex justify-center items-center">
        <Spinner size={50} />
      </Holds>
    );
  }

  if (error) {
    return (
      <Holds className="row-span-full flex flex-col justify-center items-center gap-4">
        <Titles size="h3" className="text-red-500">
          Error Loading Document
        </Titles>
        <Titles size="h4">{error}</Titles>
        <Buttons onClick={() => router.back()} background="lightBlue">
          Return to Documents
        </Buttons>
      </Holds>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* PDF Viewer Section - Takes up most space */}
      <Holds className="grow h-full w-full">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-none"
            title="PDF Viewer"
          />
        ) : (
          <Holds className="flex justify-center items-center h-full">
            <Titles size="h3">Loading PDF...</Titles>
          </Holds>
        )}
      </Holds>

      {/* Buttons Section - Fixed at bottom */}
      <Holds className="flex items-center justify-between p-4 gap-4">
        {pdfUrl && (
          <a
            href={pdfUrl}
            download="document.pdf"
            className="border-[3px] border-black rounded-[10px] bg-app-blue shadow-[8px_8px_0px_grey] text-white px-3 py-2 hover:brightness-110 transition self-center w-full"
          >
            Download PDF
          </a>
        )}
        <Buttons onClick={() => router.back()} background="lightBlue">
          Return to Documents
        </Buttons>
      </Holds>
    </div>
  );
}
