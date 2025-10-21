import { IceServer } from "@/types/IceServers";
import { useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface WebRTCOptions {
  socket: Socket | null;
  targetId?: string;
}

export function useWebRTC({
  socket,
  targetId: initialTargetId,
}: WebRTCOptions) {
  const pc = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const targetId = useRef<string | null>(initialTargetId || null);
  const [isConnectionEstablished, setIsConnectionEstablished] =
    useState<boolean>(false);

  const setTargetId = (id: string) => {
    targetId.current = id;
  };

  const initConnection = (iceServers: IceServer[]) => {
    if (pc.current) return;

    pc.current = new RTCPeerConnection({
      iceServers: iceServers,
    });

    if (targetId.current) {
      // Initiator creates data channel
      dataChannel.current = pc.current.createDataChannel("file-text-channel");
      dataChannel.current.onopen = () => {
        setIsConnectionEstablished(true);
      };
      // dataChannel.current.onmessage = (e) => console.log("Received:", e.data);
    } else {
      // Receiver waits for data channel
      pc.current.ondatachannel = (event) => {
        dataChannel.current = event.channel;
        dataChannel.current.onopen = () => {
          setIsConnectionEstablished(true);
        };
        // dataChannel.current.onmessage = (event) => console.log("Received on receiver side:", event.data);
      };
    }

    pc.current.onicecandidate = (event) => {
      if (!socket) return;

      if (event.candidate) {
        try {
          const candidateData = event.candidate.toJSON();

          if (candidateData) {
            socket.emit("ice-candidate", {
              targetId: targetId.current,
              candidate: candidateData,
            });
          }
        } catch (error) {
          console.error("Failed to serialize ICE candidate:", error);
        }
      } else {
        console.log("End of ICE candidates");
      }
    };

    if (!socket) return;
    socket.on("ice-candidate", ({ candidate }) => {
      pc.current
        ?.addIceCandidate(new RTCIceCandidate(candidate))
        .catch((err) => console.error("Failed to add ICE candidate:", err));
    });
  };

  const createOffer = async () => {
    const userAgent = navigator.userAgent;
    if (!socket || !pc.current || !targetId) return;
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    console.log(userAgent);
    socket.emit("offer", { targetId: targetId.current, offer, userAgent });
  };

  const handleOffer = async (
    offer: RTCSessionDescriptionInit,
    from: string,
    userAgent: string,
    iceServers: IceServer[]
  ) => {
    userAgent = navigator.userAgent; // override the remote user agent with local user agent
    if (!pc.current) initConnection(iceServers);
    if (!socket || !pc.current) return;

    await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);
    socket.emit("answer", { targetId: from, answer, userAgent });
  };

  const handleAnswer = async (
    answer: RTCSessionDescriptionInit,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fromUserAgent?: string
  ) => {
    if (!pc.current) return;
    await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
    console.log("Answer received from:", fromUserAgent);
  };

  const sendData = (data: string | Blob) => {
    if (!dataChannel.current) {
      console.warn("No data channel available!");
      return;
    }

    if (dataChannel.current.readyState !== "open") {
      console.warn(
        "Data channel not open yet. Current state:",
        dataChannel.current.readyState
      );
      return;
    }

    if (typeof data === "string") {
      dataChannel.current.send(data);
    } else {
      dataChannel.current.send(data);
    }
  };

  return {
    pc,
    dataChannel,
    isConnectionEstablished,
    initConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    sendData,
    setTargetId,
  };
}
