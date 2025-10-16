export interface ConnectionRequestProps {
  DeviceName: string;
  onConnect: () => void;
  onIgnore: () => void;
}
