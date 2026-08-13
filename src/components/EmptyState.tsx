export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty-state">
      <div>
        <p className="font-black text-slate-800">{title}</p>
        <p className="mt-2 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}
