"use client";
// import { ConnectionEstablished } from "@/components/ConnectionEstablished";
import { ConnectionField } from "@/components/ConnectionField";
import { ConnectionRequest } from "@/components/ConnectionRequest";
// import { ConnectionShared } from "@/components/ConnectionShared";
import { useWebRTC } from "@/hooks/useWebRTC";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [wsId, setWsId] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<{
    userAgent: string;
    requesterId: string;
  } | null>(null);

  // WebRTC hook at top level
  const {
    pc,
    initConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    setTargetId,
  } = useWebRTC({
    socket,
    targetId: requestData?.requesterId,
  });

  useEffect(() => {
    if (requestData?.requesterId) {
      setTargetId(requestData.requesterId); // update target dynamically
    }
  }, [requestData]);

  useEffect(() => {
    if (!socket) return;

    socket.on("offer", async ({ offer, from }) => {
      handleOffer(offer, from);
    });
    socket.on("answer", async ({ answer }) => handleAnswer(answer));
    socket.on("ice-candidate", ({ candidate }) =>
      pc.current?.addIceCandidate(new RTCIceCandidate(candidate))
    );
  }, [socket]);

  const handleRequestConnect = async () => {
    if (!requestData?.requesterId) return; // ensure we have the target
    setTargetId(requestData.requesterId);

    initConnection();

    // Wait a tick so targetId.current updates
    await new Promise((res) => setTimeout(res, 0));

    await createOffer();
    setRequestData(null);
  };
  const handleIgnore = () => setRequestData(null);

  return (
    <div>
      <Header />
      <main>
        <ConnectionField
          socket={socket}
          setSocket={setSocket}
          wsId={wsId}
          setWsId={setWsId}
          setRequestData={setRequestData}
        />

        {requestData && (
          <div className="fixed top-0 right-0 rounded-2xl bg-[#D9D9D9] max-w-[426] p-5 m-5">
            <ConnectionRequest
              DeviceName={requestData.userAgent}
              onConnect={handleRequestConnect}
              onIgnore={handleIgnore}
            />
          </div>
        )}
        {/* <div className="flex flex-row ml-[10%]">
          <ConnectionEstablished DeviceName="Device: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36" />
          <ConnectionShared />
        </div> */}
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="relative flex flex-row items-center h-16 px-4">
      <div className="flex flex-row items-center gap-2 ml-[10%] min-w-[120px] w-[30%]">
        <Image src={"/vercel.svg"} height={40} width={40} alt="Logo" />
        <span>ShareZap</span>
      </div>

      <div className="right-0 absolute sm:left-1/2 transform sm:-translate-x-1/2 text-center pointer-events-none">
        <span className="font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
          CONNECT NOW, SHARE LATER!
        </span>
      </div>
    </header>
  );
}
