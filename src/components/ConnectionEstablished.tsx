"use client";
import { ConnectionEstablishedProps } from "@/types/ConnectionEstablishedProps";
import { useRef, useState } from "react";

export function ConnectionEstablished({
  DeviceName,
  sendData,
}: ConnectionEstablishedProps) {
  const [text, setText] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (result instanceof ArrayBuffer) {
        const metadata = {
          type: "file",
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        };
        sendData(JSON.stringify(metadata));

        const blob = new Blob([result], { type: file.type });
        sendData(blob);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUploadClick = () => {
    console.log("button clicked");
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2 m-2 flex-1 border-r border-gray-500 pr-5">
      <span>{DeviceName}</span>
      <input
        placeholder="Write text....."
        type="textarea"
        className="bg-white p-4 rounded-lg text-black"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />
      <div className="flex flex-row ">
        <button
          className="rounded-2xl bg-[#CD0202] text-white px-3 py-1"
          onClick={handleUploadClick}
        >
          Upload File
        </button>

        <button
          className="rounded-2xl bg-[#6A70D9] text-white px-3 py-1"
          onClick={() => sendData(text)}
        >
          Send Text
        </button>
      </div>
    </div>
  );
}
