import { QRCodeSVG } from "qrcode.react";

export function TicketQrCode({ value, large = false, used = false }) {
  return (
    <div
      className={`ticket-qr ${large ? "ticket-qr--large" : ""} ${used ? "ticket-qr--used" : ""}`}
      aria-label={used ? "QR Code de ingresso com check-in realizado" : "QR Code do ingresso"}
    >
      <QRCodeSVG
        value={value}
        size={large ? 320 : 176}
        bgColor="#ffffff"
        fgColor="#000000"
        level="M"
        marginSize={4}
        title="QR Code do ingresso UniEvent"
      />
      {used && <span>Utilizado</span>}
    </div>
  );
}
