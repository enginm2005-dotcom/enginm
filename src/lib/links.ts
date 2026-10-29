import { hotel } from "@/config/hotel";

export const telHref = `tel:${hotel.contact.phone}`;
export const mailHref = (subject?: string, body?: string) => {
  const q = new URLSearchParams();
  if (subject) q.set("subject", subject);
  if (body) q.set("body", body);
  const qs = q.toString().replace(/\+/g, "%20");
  return `mailto:${hotel.contact.email}${qs ? `?${qs}` : ""}`;
};
export const whatsappHref = (text?: string) =>
  `https://wa.me/${hotel.contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
