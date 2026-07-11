function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Attachment = { id: string; fileName: string; size: number; mimeType: string };

export function AttachmentsList({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-2 text-sm font-semibold text-slate-800">Attachments</p>
      <ul className="space-y-1.5">
        {attachments.map((a) => (
          <li key={a.id}>
            <a
              href={`/api/attachments/${a.id}`}
              className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="truncate">{a.fileName}</span>
              <span className="shrink-0 text-xs text-slate-400">{formatSize(a.size)}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
