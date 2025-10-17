export type ConnectionEstablishedProps = {
  DeviceName: string | null;
  sendData: (data: string | Blob) => void;
};
