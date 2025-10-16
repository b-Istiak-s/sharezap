"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function ConnectionField({
  socket,
  setSocket,
  wsId,
  setWsId,
  setRequestData,
}: {
  socket: Socket | null;
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;
  wsId?: string | null;
  setWsId: React.Dispatch<React.SetStateAction<string | null>>;
  setRequestData: React.Dispatch<
    React.SetStateAction<{ userAgent: string; requesterId: string } | null>
  >;
}) {
  const [digits, setDigits] = useState<number>(222222);
  const [clientDigits, setClientDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // allow only 1 digit
    const newDigits = [...clientDigits];
    newDigits[idx] = value;
    setClientDigits(newDigits);

    if (value && idx < clientDigits.length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const fetchDigits = useCallback(async (currentWsId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/codes/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ wsId: currentWsId }),
        }
      );
      if (!res.ok) {
        console.log("Something went wrong. Fetching again.");
        fetchDigits(currentWsId);
      }
      const data = await res.json();
      setDigits(data.code);

      // Calculate how long until expiration
      const now = Date.now();
      const delay = data.expiresAt - now;

      if (delay > 0) {
        setTimeout(() => fetchDigits(currentWsId), delay);
      } else {
        // If expired already, fetch immediately
        fetchDigits(currentWsId);
      }
    } catch (error) {
      console.error("Error fetching digits:", error);
    }
  }, []);

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_BACKEND_URL);
    setSocket(s);

    s.on("connect", () => {});

    s.on("register", (data: { wsId: string }) => {
      console.log(data.wsId);
      setWsId(data.wsId);
      fetchDigits(data.wsId);
    });

    s.on("request", (data: { userAgent: string; requesterId: string }) => {
      setRequestData(data);
    });

    return () => {
      s.disconnect();
    };
  }, [fetchDigits]);

  const handleConnect = async () => {
    if (!socket) return;

    try {
      const code = clientDigits.join("");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/codes/verify?code=${code}&ws-id=${wsId}`,
        {
          headers: {
            "ws-id": wsId || "",
          },
        }
      );
      if (!res.ok) {
        console.log("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching digits:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 justify-center items-center h-screen">
        <span>Connect with your device with the following numbers</span>

        {/* Fixed numbers (read-only) */}
        <div className="flex space-x-2">
          {digits
            .toString()
            .split("")
            .map((num, idx) => (
              <input
                key={idx}
                value={num}
                disabled
                className="w-10 h-10 text-center bg-white border border-gray-400 rounded cursor-not-allowed"
              />
            ))}
        </div>

        {/* Editable fields */}
        <div className="flex space-x-2">
          {clientDigits.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              className="w-10 h-10 text-center bg-white border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ))}
        </div>

        <button
          className="mt-3 px-4 py-2 bg-gray-600 text-white rounded focus:bg-gray-700 active:bg-gray-800"
          onClick={handleConnect}
        >
          Connect
        </button>
      </div>
    </>
  );
}
