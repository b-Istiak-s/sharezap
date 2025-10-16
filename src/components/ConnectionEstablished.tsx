import { DeviceNameProps } from "@/types/DeviceNameProps";

export function ConnectionEstablished({ DeviceName }: DeviceNameProps) {
  return (
    <div className="flex flex-col gap-2 m-2 flex-1 border-r border-gray-500 pr-5">
      <span>{DeviceName}</span>
      <input
        placeholder="Write text....."
        type="textarea"
        className="bg-white p-4 rounded-lg text-black"
      />
      <div className="flex flex-row ">
        <button className="rounded-2xl bg-[#CD0202] text-white px-3 py-1">
          Upload File
        </button>

        <button className="rounded-2xl bg-[#6A70D9] text-white px-3 py-1">
          Send Text
        </button>
      </div>
    </div>
  );
}
