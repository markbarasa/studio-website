// components/ContractGenerator.tsx
"use client";

import { useState, useRef } from "react";

type Booking = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  service: string;
  package: string;
  price: number;
  deposit: number;
  status: string;
  date: string;
  venue?: string;
  message?: string;
};

type ContractGeneratorProps = {
  booking: Booking;
  onClose: () => void;
};

type ContractTerms = {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  eventDate: string;
  eventVenue: string;
  eventType: string;
  packageName: string;
  totalPrice: number;
  depositAmount: number;
  balanceAmount: number;
  paymentTerms: string;
  cancellationPolicy: string;
  deliverables: string;
  additionalTerms: string;
};

export default function ContractGenerator({ booking, onClose }: ContractGeneratorProps) {
  const [step, setStep] = useState<"edit" | "preview" | "signed">("edit");
  const [isGenerating, setIsGenerating] = useState(false);
  const [clientSignature, setClientSignature] = useState("");
  const [studioSignature, setStudioSignature] = useState("");
  const contractRef = useRef<HTMLDivElement>(null);

  const balance = booking.price - (booking.deposit || 0);

  const [terms, setTerms] = useState<ContractTerms>({
    companyName: "Alakara Studios",
    companyAddress: "Nairobi, Kenya",
    companyPhone: "+254 797 356 421",
    companyEmail: "info@alakarastudios.com",
    clientName: booking.name,
    clientPhone: booking.phone,
    clientEmail: booking.email || "",
    eventDate: new Date(booking.date).toLocaleDateString("en-KE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    eventVenue: booking.venue || "To be confirmed",
    eventType: `${booking.service} - ${booking.package}`,
    packageName: booking.package,
    totalPrice: booking.price,
    depositAmount: booking.deposit || 0,
    balanceAmount: balance,
    paymentTerms: "50% deposit to confirm booking, balance due 7 days before event",
    cancellationPolicy: "Deposit is non-refundable. Cancellation within 14 days of event: 50% of total fee. Cancellation within 7 days: full fee applicable.",
    deliverables: getDeliverables(booking.service, booking.package),
    additionalTerms: "The client grants Alakara Studios full rights to use photographs and videos for portfolio, marketing, and promotional purposes unless otherwise agreed in writing.",
  });

  const handleChange = (field: keyof ContractTerms, value: string | number) => {
    setTerms(prev => ({ ...prev, [field]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSign = () => {
    if (!clientSignature.trim()) {
      alert("Please enter client name to sign");
      return;
    }
    setStep("signed");
  };

  const handleDownloadPDF = () => {
    // In production, use a PDF library like jsPDF or html2pdf
    const contractHTML = contractRef.current?.innerHTML;
    if (contractHTML) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Contract - ${booking.name} - ${booking.service}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; color: #000; }
                .contract-header { text-align: center; margin-bottom: 30px; }
                .contract-title { font-size: 24px; font-weight: bold; }
                .section { margin-bottom: 20px; }
                .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                td { padding: 8px; border: 1px solid #ddd; }
                .signature-box { margin-top: 40px; display: flex; justify-content: space-between; }
                .signature-line { border-top: 1px solid #000; width: 200px; margin-top: 40px; }
              </style>
            </head>
            <body>${contractHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold">📄 Contract Generator</h2>
            <p className="text-zinc-400 text-sm">Booking #{booking.id}</p>
          </div>
          <div className="flex items-center gap-3">
            {step === "edit" && (
              <button
                onClick={() => setStep("preview")}
                className="bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition"
              >
                Preview Contract
              </button>
            )}
            {step === "preview" && (
              <>
                <button
                  onClick={() => setStep("edit")}
                  className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg transition"
                >
                  ← Edit
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
                >
                  📥 Download PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition"
                >
                  🖨️ Print
                </button>
                <button
                  onClick={handleSign}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
                >
                  ✍️ Sign Contract
                </button>
              </>
            )}
            {step === "signed" && (
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                📥 Download Signed PDF
              </button>
            )}
            <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "edit" && (
            <div className="space-y-4">
              {/* Company Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">🏢 Company Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={terms.companyName}
                      onChange={(e) => handleChange("companyName", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Company Phone</label>
                    <input
                      type="text"
                      value={terms.companyPhone}
                      onChange={(e) => handleChange("companyPhone", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-zinc-400 mb-1">Company Address</label>
                    <input
                      type="text"
                      value={terms.companyAddress}
                      onChange={(e) => handleChange("companyAddress", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Company Email</label>
                    <input
                      type="email"
                      value={terms.companyEmail}
                      onChange={(e) => handleChange("companyEmail", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Client Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">👤 Client Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={terms.clientName}
                      onChange={(e) => handleChange("clientName", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Client Phone</label>
                    <input
                      type="text"
                      value={terms.clientPhone}
                      onChange={(e) => handleChange("clientPhone", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Client Email</label>
                    <input
                      type="email"
                      value={terms.clientEmail}
                      onChange={(e) => handleChange("clientEmail", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">📅 Event Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Event Date</label>
                    <input
                      type="text"
                      value={terms.eventDate}
                      onChange={(e) => handleChange("eventDate", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Venue</label>
                    <input
                      type="text"
                      value={terms.eventVenue}
                      onChange={(e) => handleChange("eventVenue", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-zinc-400 mb-1">Event Type</label>
                    <input
                      type="text"
                      value={terms.eventType}
                      onChange={(e) => handleChange("eventType", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">💰 Financial Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Total Price (KSh)</label>
                    <input
                      type="number"
                      value={terms.totalPrice}
                      onChange={(e) => handleChange("totalPrice", Number(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Deposit (KSh)</label>
                    <input
                      type="number"
                      value={terms.depositAmount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleChange("depositAmount", val);
                        handleChange("balanceAmount", terms.totalPrice - val);
                      }}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Balance (KSh)</label>
                    <input
                      type="number"
                      value={terms.balanceAmount}
                      disabled
                      className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 text-sm text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Payment Terms</label>
                    <input
                      type="text"
                      value={terms.paymentTerms}
                      onChange={(e) => handleChange("paymentTerms", e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">📋 Terms & Conditions</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Cancellation Policy</label>
                    <textarea
                      value={terms.cancellationPolicy}
                      onChange={(e) => handleChange("cancellationPolicy", e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Deliverables</label>
                    <textarea
                      value={terms.deliverables}
                      onChange={(e) => handleChange("deliverables", e.target.value)}
                      rows={4}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Additional Terms</label>
                    <textarea
                      value={terms.additionalTerms}
                      onChange={(e) => handleChange("additionalTerms", e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW MODE */}
          {(step === "preview" || step === "signed") && (
            <div ref={contractRef} className="bg-white text-black p-8 rounded-lg">
              {/* Contract Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold uppercase mb-2">Service Agreement Contract</h1>
                <p className="text-gray-600">Contract No: ALK-{booking.id}-{new Date().getFullYear()}</p>
                <p className="text-gray-600">Date: {new Date().toLocaleDateString("en-KE")}</p>
              </div>

              {/* Parties */}
              <div className="mb-6">
                <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-3">1. PARTIES</h2>
                <p className="mb-2">
                  <strong>Service Provider:</strong> {terms.companyName}<br />
                  Address: {terms.companyAddress}<br />
                  Phone: {terms.companyPhone}<br />
                  Email: {terms.companyEmail}
                </p>
                <p>
                  <strong>Client:</strong> {terms.clientName}<br />
                  Phone: {terms.clientPhone}<br />
                  {terms.clientEmail && <>Email: {terms.clientEmail}<br /></>}
                </p>
              </div>

              {/* Event Details */}
              <div className="mb-6">
                <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-3">2. EVENT DETAILS</h2>
                <table className="w-full mb-3">
                  <tbody>
                    <tr>
                      <td className="py-1 pr-4"><strong>Event Date:</strong></td>
                      <td>{terms.eventDate}</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4"><strong>Venue:</strong></td>
                      <td>{terms.eventVenue}</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4"><strong>Event Type:</strong></td>
                      <td>{terms.eventType}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Terms */}
              <div className="mb-6">
                <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-3">3. FINANCIAL TERMS</h2>
                <table className="w-full mb-3">
                  <tbody>
                    <tr>
                      <td className="py-1 pr-4"><strong>Total Package Price:</strong></td>
                      <td>KSh {terms.totalPrice.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4"><strong>Deposit Paid:</strong></td>
                      <td>KSh {terms.depositAmount.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4"><strong>Balance Due:</strong></td>
                      <td>KSh {terms.balanceAmount.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-1 pr-4"><strong>Payment Terms:</strong></td>
                      <td>{terms.paymentTerms}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Deliverables */}
              <div className="mb-6">
                <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-3">4. DELIVERABLES</h2>
                <div className="whitespace-pre-line text-sm">{terms.deliverables}</div>
              </div>

              {/* Cancellation Policy */}
              <div className="mb-6">
                <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-3">5. CANCELLATION POLICY</h2>
                <p className="text-sm">{terms.cancellationPolicy}</p>
              </div>

              {/* Additional Terms */}
              <div className="mb-8">
                <h2 className="text-lg font-bold border-b-2 border-gray-300 pb-2 mb-3">6. ADDITIONAL TERMS</h2>
                <p className="text-sm">{terms.additionalTerms}</p>
              </div>

              {/* Signatures */}
              <div className="mt-12">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="border-t-2 border-gray-400 pt-2">
                      <p className="font-bold">{terms.companyName}</p>
                      <p className="text-sm text-gray-600">Service Provider</p>
                      {step === "signed" && studioSignature && (
                        <p className="text-sm mt-1">Signed: {studioSignature}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">Date: _________________</p>
                    </div>
                  </div>
                  <div>
                    <div className="border-t-2 border-gray-400 pt-2">
                      <p className="font-bold">{terms.clientName}</p>
                      <p className="text-sm text-gray-600">Client</p>
                      {step === "signed" && clientSignature && (
                        <p className="text-sm mt-1 text-green-600">✓ Signed: {clientSignature}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">Date: {new Date().toLocaleDateString("en-KE")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {step === "signed" && (
                <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg text-center">
                  <p className="text-green-800 font-semibold">✅ Contract Signed</p>
                  <p className="text-green-600 text-sm">
                    Signed on {new Date().toLocaleDateString("en-KE", { 
                      weekday: "long", 
                      year: "numeric", 
                      month: "long", 
                      day: "numeric" 
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Signature Section (shown in preview mode) */}
        {step === "preview" && (
          <div className="border-t border-zinc-800 p-6 bg-zinc-900/50">
            <h3 className="font-semibold mb-3">✍️ Sign Contract</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Client Signature (Type Name)</label>
                <input
                  type="text"
                  value={clientSignature}
                  onChange={(e) => setClientSignature(e.target.value)}
                  placeholder={terms.clientName}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Studio Representative</label>
                <input
                  type="text"
                  value={studioSignature}
                  onChange={(e) => setStudioSignature(e.target.value)}
                  placeholder="Studio Representative Name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-sm focus:border-white transition"
                />
              </div>
            </div>
            <button
              onClick={handleSign}
              disabled={!clientSignature.trim()}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition"
            >
              {clientSignature.trim() ? "✍️ Sign Contract" : "Enter Client Name to Sign"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- HELPER FUNCTION ---------------- */
function getDeliverables(service: string, packageName: string): string {
  const serviceLower = service.toLowerCase();
  const packageLower = packageName.toLowerCase();

  // Wedding Deliverables
  if (serviceLower.includes("wedding") || serviceLower.includes("traditional")) {
    if (packageLower.includes("basic")) {
      return `• 1 Professional Photographer
• 1 Professional Videographer
• Full Event Photo Coverage
• 1 Final Edited Video (10-15 minutes)
• Digital Gallery (Online Access)
• One A3 Photo Mount
• Delivery: 2-3 weeks after event`;
    } else if (packageLower.includes("standard")) {
      return `• 1 Professional Photographer
• 1 Professional Videographer
• Full Event Photo Coverage
• 1 Final Edited Video (15-20 minutes)
• Drone Coverage (Weather Permitting)
• Digital Gallery (Online Access)
• One A3 Photo Mount
• Additional Videographer Available (+KSh 10,000)
• Delivery: 2-3 weeks after event`;
    } else if (packageLower.includes("premium")) {
      return `• 2 Professional Photographers
• 2 Professional Videographers
• Full Event Photo Coverage (Dual Angles)
• 1 Final Edited Video (20-30 minutes)
• Drone Ring Delivery Service
• Digital Gallery with Unlimited Downloads
• One A2 Photo Mount
• One A3 Photo Book (20 Pages)
• Behind-the-Scenes Highlights
• Express Delivery Available
• Delivery: 1-2 weeks after event`;
    }
  }

  // Corporate Deliverables
  if (serviceLower.includes("corporate")) {
    if (packageLower.includes("basic")) {
      return `• 1 Professional Photographer
• 4 Hours Event Coverage
• 50 Professionally Edited Photos
• Digital Gallery (Online Access)
• Photo Delivery: 5-7 business days`;
    } else if (packageLower.includes("standard")) {
      return `• 1 Photographer + 1 Videographer
• 8 Hours Event Coverage
• 100 Professionally Edited Photos
• 1 Highlight Video (3-5 minutes)
• Digital Gallery + USB Delivery
• Company Branding Overlay
• Delivery: 5-7 business days`;
    } else if (packageLower.includes("premium")) {
      return `• 2 Photographers + 1 Videographer
• Full Day Coverage (12 Hours)
• 200+ Professionally Edited Photos
• Full Event Video + 3-5 min Highlights
• Drone Coverage (Weather Permitting)
• Live Social Media Updates
• Express 48-Hour Photo Delivery
• Digital Gallery + USB + Cloud Backup
• Company Branding Throughout`;
    }
  }

  // Podcast Deliverables
  if (serviceLower.includes("podcast")) {
    if (packageLower.includes("basic") || packageLower.includes("audio")) {
      return `• Professional Audio Recording
• 1 Hour Studio Session
• Noise Reduction Processing
• MP3 File Delivery
• Up to 2 Guests
• Delivery: 3-5 business days`;
    } else if (packageLower.includes("video") || packageLower.includes("standard")) {
      return `• Audio + Video Recording
• 2 Hour Studio Session
• 2 Camera Angles (Wide + Close-up)
• Basic Lighting Setup
• Edited Video + Synced Audio
• Up to 3 Guests
• YouTube-Ready Export
• Delivery: 5-7 business days`;
    } else if (packageLower.includes("studio") || packageLower.includes("premium")) {
      return `• Full Studio Production Setup
• 4 Hour Session
• 3 Camera Angles
• Professional Lighting Rig
• Live Streaming Setup Available
• Custom Background Options
• Full Post-Production Editing
• Social Media Clips Package (5 clips)
• YouTube + Podcast Platform Ready
• Delivery: 7-10 business days`;
    }
  }

  // Documentary Deliverables
  if (serviceLower.includes("documentary")) {
    if (packageLower.includes("short") || packageLower.includes("basic")) {
      return `• 1 Videographer
• 5-10 Minute Final Film
• 2 Interview Sessions
• B-Roll Coverage
• Basic Color Grading
• Background Music (Licensed)
• Delivery: 3-4 weeks`;
    } else if (packageLower.includes("standard")) {
      return `• 2 Videographers
• 15-20 Minute Final Film
• 4 Interview Sessions
• Drone Footage (Weather Permitting)
• Professional Color Grading
• Licensed Music Score
• Voice-over Recording Session
• Delivery: 4-6 weeks`;
    } else if (packageLower.includes("premium")) {
      return `• Full Production Crew
• 30+ Minute Feature Film
• Unlimited Interview Sessions
• Drone + Gimbal Footage
• Cinematic Color Grading
• Custom Music Score/Soundtrack
• Archival Research & Integration
• Film Festival Ready Export
• Social Media Trailer (60 seconds)
• Delivery: 6-8 weeks`;
    }
  }

  // Funeral Deliverables
  if (serviceLower.includes("funeral")) {
    if (packageLower.includes("basic")) {
      return `• 1 Professional Photographer
• Ceremony + Burial Photo Coverage
• 50 Edited Photos
• Digital Gallery
• Memorial Photo Mount
• Delivery: 1-2 weeks`;
    } else if (packageLower.includes("standard")) {
      return `• 1 Photographer + 1 Videographer
• Full Service Coverage
• 100 Edited Photos
• Memorial Video (5-8 minutes)
• One A3 Photo Mount
• USB + Digital Delivery
• Delivery: 1-2 weeks`;
    } else if (packageLower.includes("premium")) {
      return `• 2 Photographers + 1 Videographer
• Full Day Coverage
• 200+ Edited Photos
• Extended Memorial Film (10-15 minutes)
• Drone Coverage (Weather Permitting)
• One A2 Photo Mount
• Memorial Photo Book (20 Pages)
• Express 24-Hour Photo Delivery
• Digital Gallery with Sharing Options`;
    }
  }

  // Default
  return `• Professional photography and/or videography coverage
• Edited digital files delivered via online gallery
• Delivery timeline: 2-4 weeks after event
• Print release included`;
}