import { useState } from "react";
import { Link2 } from "lucide-react";
import { parentReportUrl } from "../../lib/parentLink";

export function CopyParentLink({ studentId }: { studentId: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(parentReportUrl(studentId));
    } catch {
      window.prompt("Copy parent link", parentReportUrl(studentId));
    }
    setCopied(true);
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
