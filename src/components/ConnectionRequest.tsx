import { ConnectionRequestProps } from "@/types/ConnectionRequestProps";

export function ConnectionRequest({
  DeviceName,
  onConnect,
  onIgnore,
}: ConnectionRequestProps) {
  return (
    <div className="rounded-lg flex gap-2">
      <span>
        {DeviceName.length > 60 ? DeviceName.slice(0, 60) + "..." : DeviceName}
        <span className="text-pink-400"> wishes to connect</span>
      </span>
      <div className="flex flex-row gap-2">
        <button
          onClick={onConnect}
          className="rounded-2xl bg-[#6A70D9] text-white p-2 hover:bg-[#5a60c7] active:bg-[#4b50b5]"
        >
          Connect
        </button>
        <button
          onClick={onIgnore}
          className="rounded-2xl bg-[#FF0000] text-white p-2 hover:bg-[#e50000] active:bg-[#cc0000]"
        >
          Ignore
        </button>
      </div>
    </div>
  );
}
