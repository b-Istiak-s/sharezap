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

  const initConnection = () => {
    pc.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.relay.metered.ca:80",
        },
        {
          urls: "turn:global.relay.metered.ca:80",
          username: "1c8a5390618907f4d612e982",
          credential: "jO4BgZXTfR6xtYey",
        },
      ],
    });

    if (targetId) {
      // Initiator creates data channel
      dataChannel.current = pc.current.createDataChannel("file-text-channel");
      dataChannel.current.onopen = () => setIsConnectionEstablished(true);
      dataChannel.current.onmessage = (e) => console.log("Received:", e.data);
    } else {
      // Receiver waits for data channel
      pc.current.ondatachannel = (event) => {
        dataChannel.current = event.channel;
        dataChannel.current.onopen = () => setIsConnectionEstablished(true);
        dataChannel.current.onmessage = (e) => console.log("Received:", e.data);
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
    if (!socket || !pc.current || !targetId) return;
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    socket.emit("offer", { targetId: targetId.current, offer });
  };

  const handleOffer = async (
    offer: RTCSessionDescriptionInit,
    from: string
  ) => {
    if (!pc.current) initConnection();
    if (!socket || !pc.current) return;

    await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);
    socket.emit("answer", { targetId: from, answer });
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!pc.current) return;
    await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const sendData = (data: string | Blob) => {
    if (dataChannel.current) {
      if (typeof data === "string") {
        dataChannel.current.send(data);
      } else {
        dataChannel.current.send(data);
      }
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
