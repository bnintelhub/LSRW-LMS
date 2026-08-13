import { useState } from "react";
import { Megaphone } from "lucide-react";
import { useAppStore } from "../../context/AppStoreContext";
import { useToast } from "../../context/ToastContext";
import type { Announcement } from "../../types/progress";

export function AnnouncementsAdmin() {
  const { announcements, addAnnouncement, updateAnnouncement } = useAppStore();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<Announcement["audience"]>("student");

  const publish = () => {
    if (!title.trim() || !message.trim()) return;
    addAnnouncement({ title: title.trim(), message: message.trim(), audience, active: true });
    setTitle("");
    setMessage("");
    toast("Announcement published");
  };

  return (
    <div className="space-y-5">
      <div className="panel-card">
        <p className="text-xs font-black uppercase tracking-wide text-orange-600">School Admin</p>
        <h1 className="mt-1 flex items-center gap-2 text-3xl font-black">
          <Megaphone size={26} /> Announcements
        </h1>
        <p className="mt-1 text-sm text-slate-600">Active student messages appear on the student dashboard.</p>
      </div>

      <div className="panel-card space-y-3">
        <input
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 font-black"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="h-24 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
          placeholder="Message for the school"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <select
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"
          value={audience}
          onChange={(e) => setAudience(e.target.value as Announcement["audience"])}
        >
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="all">Everyone</option>
        </select>
        <button className="rounded-xl bg-orange-500 px-5 py-2.5 font-black text-white" onClick={publish}>
          Publish announcement
        </button>
      </div>

      <div className="space-y-3">
        {!announcements.length && <div className="empty-state">No announcements yet.</div>}
        {announcements.map((item) => (
          <div key={item.id} className="panel-card flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-black">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              <p className="mt-2 text-xs font-bold uppercase text-slate-400">
                {item.audience} · {item.createdAt.slice(0, 10)}
              </p>
            </div>
            <button
              className={`rounded-full px-3 py-1 text-xs font-black ${
                item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}
              onClick={() => updateAnnouncement({ ...item, active: !item.active })}
            >
              {item.active ? "Active" : "Hidden"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnnouncementBanner({ audience }: { audience: "student" | "teacher" }) {
  const { announcements } = useAppStore();
  const visible = announcements.filter(
    (item) => item.active && (item.audience === "all" || item.audience === audience),
  );
  if (!visible.length) return null;
  return (
    <div className="space-y-2">
      {visible.slice(0, 2).map((item) => (
        <div key={item.id} className="flex items-start gap-3 rounded-[1.5rem] border border-sky-200 bg-sky-50 px-5 py-4">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-500 text-white">
            <Megaphone size={18} />
          </div>
          <div>
            <p className="font-black text-sky-950">{item.title}</p>
            <p className="text-sm font-semibold text-sky-800">{item.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
