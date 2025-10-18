"use client";
import { ConnectionEstablished } from "@/components/ConnectionEstablished";
import { ConnectionField } from "@/components/ConnectionField";
import { ConnectionRequest } from "@/components/ConnectionRequest";
import { ConnectionShared } from "@/components/ConnectionShared";
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
  const [fromUserAgent, setFromUserAgent] = useState<string | null>(null);

  // WebRTC hook at top level
  const {
    pc,
    dataChannel,
    isConnectionEstablished,
    initConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    setTargetId,
    sendData,
  } = useWebRTC({
    socket,
    targetId: requestData?.requesterId,
  });

  useEffect(() => {
    if (requestData?.requesterId) {
      setTargetId(requestData.requesterId); // update target dynamically
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestData]);

  useEffect(() => {
    if (!socket) return;

    const onOffer = async ({
      offer,
      from,
      userAgent,
    }: {
      offer: RTCSessionDescriptionInit;
      from: string;
      userAgent: string;
    }) => {
      handleOffer(offer, from, userAgent);
      setFromUserAgent(userAgent);
    };

    const onAnswer = async ({
      answer,
      userAgent,
    }: {
      answer: RTCSessionDescriptionInit;
      userAgent: string;
    }) => {
      handleAnswer(answer, userAgent);
      setFromUserAgent(userAgent);
    };

    const onIceCandidate = ({
      candidate,
    }: {
      candidate: RTCIceCandidateInit;
    }) => {
      pc.current?.addIceCandidate(new RTCIceCandidate(candidate));
    };

    socket.on("offer", onOffer);
    socket.on("answer", onAnswer);
    socket.on("ice-candidate", onIceCandidate);

    return () => {
      socket.off("offer", onOffer);
      socket.off("answer", onAnswer);
      socket.off("ice-candidate", onIceCandidate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {!isConnectionEstablished ? (
          <>
            <ConnectionField
              socket={socket}
              isConnectionEstablished={isConnectionEstablished}
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
          </>
        ) : (
          <div className="flex flex-row ml-[10%]">
            <ConnectionEstablished
              DeviceName={fromUserAgent}
              sendData={sendData}
            />
            <ConnectionShared dataChannel={dataChannel} />
          </div>
        )}
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
