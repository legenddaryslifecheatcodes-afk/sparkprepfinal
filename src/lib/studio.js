// Legenddary SparkPrep Author Studio: small helpers shared by the Studio pages.
import { api, fmtErr } from "@/lib/api";
import { toast } from "sonner";

export async function studioCall(fn, okMsg) {
  try {
    const { data } = await fn();
    if (okMsg) toast.success(okMsg);
    return data;
  } catch (e) {
    const d = e.response?.data?.detail;
    if (d?.code === "members_only") toast.error("This part of the Author Studio is for members.");
    else toast.error(fmtErr(d));
    return null;
  }
}

export async function downloadStudioFile(file) {
  try {
    const { data } = await api.get(`/studio/files/${file.id}/link`);
    if (data.url) { window.location.href = data.url; return; }
    const res = await api.get(`/studio/files/${file.id}/download`, { responseType: "blob" });
    const href = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = href; a.download = data.filename || file.name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 4000);
  } catch (e) {
    toast.error("That file couldn't be downloaded. Please try again.");
  }
}

export function fmtBytes(n) {
  if (!n) return "0 MB";
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function fmtDay(iso) {
  if (!iso) return "";
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function daysUntil(isoDay) {
  if (!isoDay) return null;
  const t = new Date(`${isoDay}T12:00:00`).getTime();
  const now = new Date(); now.setHours(12, 0, 0, 0);
  return Math.round((t - now.getTime()) / 86400000);
}
