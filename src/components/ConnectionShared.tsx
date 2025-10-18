"use client";
import { SharedItem } from "@/types/SharedItem";
import { useEffect, useRef, useState } from "react";

export function ConnectionShared({
  dataChannel,
}: {
  dataChannel: React.RefObject<RTCDataChannel | null>;
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [sharedData, setSharedData] = useState<SharedItem[]>([]);
  const incomingFileMeta = useRef<{
    fileName: string;
    fileSize: number;
    mimeType: string;
  } | null>(null);

  useEffect(() => {
    const channel = dataChannel.current;
    if (!channel) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data: SharedItem = JSON.parse(event.data);
        if (
          data.type === "file" &&
          data.fileName &&
          data.fileSize &&
          data.mimeType
        ) {
          incomingFileMeta.current = {
            fileName: data.fileName,
            fileSize: parseInt(data.fileSize.toString(), 10),
            mimeType: data.mimeType,
          };

          return;
        }

        setSharedData((prev) => [data, ...prev]);
      } catch {
        // fallback if data is not JSON, assume text
        if (typeof event.data === "string") {
          setSharedData((prev) => [
            { type: "text", text: event.data },
            ...prev,
          ]);
        } else {
          const blob =
            event.data instanceof Blob
              ? event.data
              : new Blob([event.data], {
                  type: incomingFileMeta.current?.mimeType || "",
                });

          setSharedData((prev) => [
            {
              type: "file",
              fileName: incomingFileMeta.current?.fileName || "unknown",
              fileSize: incomingFileMeta.current?.fileSize
                ? `${incomingFileMeta.current.fileSize} bytes`
                : "unknown",
              file: blob,
            },
            ...prev,
          ]);
          // incomingFileMeta.current = null;
        }
      }
    };

    // Assign onmessage handler directly
    channel.onmessage = handleMessage;

    return () => {
      // Clear the handler on cleanup
      channel.onmessage = null;
    };
  }, [dataChannel]);

  return (
    <div className="flex flex-col gap-2 m-2 flex-1">
      <span className="font-bold">Shared</span>
      {sharedData.map((item, index) => {
        const handleCopy = () => {
          if (!item.text) return;
          navigator.clipboard.writeText(item.text);
          setCopiedIndex(index);
          setTimeout(() => setCopiedIndex(null), 5000);
        };

        return (
          <div
            key={index}
            id={`shared-item-${index}`}
            className="bg-[#D9D9D9] p-2 flex justify-between items-center w-80 rounded-lg"
          >
            {item.type === "text" ? (
              <>
                <span className="truncate mr-2">{item.text}</span>
                <button
                  className={`rounded-2xl px-3 py-1 text-white transition-colors duration-200
              ${
                copiedIndex === index
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#6A70D9] hover:bg-[#5860c3] active:bg-[#484f9f]"
              }`}
                  onClick={handleCopy}
                  disabled={copiedIndex === index}
                >
                  {copiedIndex === index ? "Copied!" : "Copy"}
                </button>
              </>
            ) : (
              <div className="flex justify-between items-center w-full">
                <div className="truncate mr-2">
                  <span>{item.fileName}</span> • <span>{item.fileSize}</span>
                </div>
                <button
                  className="rounded-2xl bg-[#484848] text-white px-3 py-1"
                  onClick={() => {
                    if (item.type === "file" && item.file) {
                      try {
                        // Ensure we have a valid Blob/File
                        if (!(item.file instanceof Blob)) {
                          console.error("Invalid file object:", item.file);
                          return;
                        }

                        const url = URL.createObjectURL(item.file);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = item.fileName || "download";
                        document.body.appendChild(a); // Some browsers need this
                        a.click();
                        document.body.removeChild(a);

                        // Clean up the URL after a short delay
                        setTimeout(() => URL.revokeObjectURL(url), 100);
                      } catch (error) {
                        console.error("Failed to download file:", error);
                        // Optionally show user feedback here
                      }
                    }
                  }}
                >
                  Download
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
