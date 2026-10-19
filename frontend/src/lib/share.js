import { toast } from "react-toastify";

export function publicUrl(slug) {
  return `${window.location.origin}/u/${slug}`;
}

export async function copyText(text, message = "Link copiado!") {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message);
  } catch {
    window.prompt("Copie o link:", text);
  }
}

export async function shareLink({ title, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  copyText(url);
}

// Números brasileiros sem DDI recebem 55.
export function whatsappLink(phone, text) {
  let digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length <= 11) digits = `55${digits}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function formatPhone(phone = "") {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return phone;
}
