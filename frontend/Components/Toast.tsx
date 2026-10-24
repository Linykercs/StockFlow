import { useEffect } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi2";

export default function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 2600);
    return () => window.clearTimeout(timer);
  }, [onClose]);
  return <div className="toast" role="status"><HiOutlineCheckCircle className="text-lg" />{message}</div>;
}
