import { useState } from "react";
import { Link2 } from "lucide-react";
import { parentReportUrl } from "../../lib/parentLink";
import { useToast } from "../../context/ToastContext";

export function CopyParentLink({ studentId }: { studentId: string }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = parentReportUrl(studentId);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy parent link", url);
    }
    setCopied(true);
    toast("Parent link copied");
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button className="rounded-xl bg-sky-50 px-3 py-2 font-bold text-sky-800" onClick={copy} type="button">
      <span className="inline-flex items-center gap-2">
        <Link2 size={15} /> {copied ? "Copied" : "Copy parent link"}
      </span>
    </button>
  );
}
