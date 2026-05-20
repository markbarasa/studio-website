"use client";

import { Download, FileText } from "lucide-react";

export default function PriceListPDF() {
  const generatePDF = () => {
    // Get current date
    const currentDate = new Date().toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Alakara Studios - Price List</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: white;
            padding: 40px;
            color: #1a1a1a;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          .header {
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: white;
            border-radius: 16px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
          }
          .header .tagline {
            color: #C6A43F;
          }
          .section {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .section h2 {
            font-size: 20px;
            margin-bottom: 15px;
            color: #1a1a1a;
            border-bottom: 2px solid #C6A43F;
            padding-bottom: 10px;
          }
          .service-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .service-name {
            font-weight: 500;
          }
          .service-price {
            color: #C6A43F;
            font-weight: bold;
          }
          .package-item {
            margin-bottom: 15px;
            padding: 10px;
            background: white;
            border-radius: 8px;
          }
          .package-name {
            font-weight: bold;
            font-size: 16px;
          }
          .package-price {
            color: #C6A43F;
            font-weight: bold;
          }
          .features {
            margin-top: 8px;
            padding-left: 20px;
            font-size: 12px;
            color: #6b7280;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            margin-top: 20px;
          }
          .contact {
            margin-top: 10px;
            font-size: 14px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Alakara Studios</h1>
            <div class="tagline">Where Moments Become Memories</div>
            <p style="margin-top: 15px; font-size: 14px;">Price List - Valid from ${currentDate}</p>
          </div>

          <!-- Wedding Packages -->
          <div class="section">
            <h2>💒 Wedding Packages</h2>
            <div class="package-item">
              <div class="service-item">
                <span class="package-name">Basic Wedding</span>
                <span class="package-price">KSh 28,000</span>
              </div>
              <div class="features">• 1 Photographer<br>• 1 Videographer<br>• Full Event Photos + 1 Final Video<br>• No Drone<br>• One A3 Photo Mount</div>
            </div>
            <div class="package-item">
              <div class="service-item">
                <span class="package-name">Standard Wedding</span>
                <span class="package-price">KSh 38,000</span>
              </div>
              <div class="features">• 1 Photographer + 1 Videographer<br>• Full Event Photos + 1 Final Video<br>• Drone Available<br>• One A3 Photo Mount</div>
            </div>
            <div class="package-item">
              <div class="service-item">
                <span class="package-name">Premium Wedding</span>
                <span class="package-price">KSh 55,000</span>
              </div>
              <div class="features">• 2 Photographers + 2 Videographers<br>• Full Event Photos + 1 Final Video<br>• Drone Coverage<br>• One A2 Photo Mount + Photo Book</div>
            </div>
          </div>

          <!-- Traditional Ceremony -->
          <div class="section">
            <h2>🏮 Traditional Ceremony</h2>
            <div class="package-item">
              <div class="service-item"><span class="package-name">Basic</span><span class="package-price">KSh 23,000</span></div>
              <div class="features">• 1 Photographer + 1 Videographer<br>• Ceremony Photos + 1 Final Video<br>• One A4 Photo Mount</div>
            </div>
            <div class="package-item">
              <div class="service-item"><span class="package-name">Standard</span><span class="package-price">KSh 33,000</span></div>
              <div class="features">• 1 Photographer + 1 Videographer<br>• Full Ceremony Photos + Video<br>• Drone Available<br>• Traditional Music Overlay</div>
            </div>
            <div class="package-item">
              <div class="service-item"><span class="package-name">Premium</span><span class="package-price">KSh 48,000</span></div>
              <div class="features">• 2 Photographers + 2 Videographers<br>• Full Ceremony + Highlight Video<br>• Drone Coverage<br>• Cultural Storytelling Edit</div>
            </div>
          </div>

          <!-- Corporate Events -->
          <div class="section">
            <h2>🏢 Corporate Events</h2>
            <div class="package-item">
              <div class="service-item"><span class="package-name">Basic</span><span class="package-price">KSh 20,000</span></div>
              <div class="features">• 1 Photographer<br>• Event Photos (4 hours)<br>• 50 Edited Photos<br>• Digital Gallery</div>
            </div>
            <div class="package-item">
              <div class="service-item"><span class="package-name">Standard</span><span class="package-price">KSh 35,000</span></div>
              <div class="features">• 1 Photographer + 1 Videographer<br>• Full Event Coverage (8 hours)<br>• 100 Edited Photos<br>• 1 Highlight Video</div>
            </div>
            <div class="package-item">
              <div class="service-item"><span class="package-name">Premium</span><span class="package-price">KSh 50,000</span></div>
              <div class="features">• 2 Photographers + 1 Videographer<br>• Full Day Coverage (12 hours)<br>• Drone Coverage<br>• Express 48hr Delivery</div>
            </div>
          </div>

          <!-- Music Videos -->
          <div class="section">
            <h2>🎵 Music & Choir Videos</h2>
            <div class="package-item">
              <div class="service-item"><span class="package-name">Basic Music Video</span><span class="package-price">KSh 10,000</span></div>
              <div class="features">• 1 Shooting Day<br>• 1 Videographer<br>• Basic Editing (2-3 min)<br>• Color Grading</div>
            </div>
            <div class="package-item">
              <div class="service-item"><span class="package-name">Music Video (with Drone)</span><span class="package-price">KSh 15,000</span></div>
              <div class="features">• 1 Videographer + Drone Operator<br>• Aerial Footage<br>• Advanced Editing (3-4 min)</div>
            </div>
            <div class="package-item">
              <div class="service-item"><span class="package-name">Choir Recording (No Drone)</span><span class="package-price">KSh 100,000</span></div>
              <div class="features">• 10 Songs<br>• Multi-Camera Setup (3 cameras)<br>• Full Editing<br>• Individual Song Videos</div>
            </div>
            <div class="package-item">
              <div class="service-item"><span class="package-name">Choir Recording (with Drone)</span><span class="package-price">KSh 150,000</span></div>
              <div class="features">• 10 Songs<br>• 3 Cameras + Drone<br>• Aerial Shots<br>• 30 sec Promo Reel</div>
            </div>
          </div>

          <!-- Studio Portraits -->
          <div class="section">
            <h2>📸 Studio Portraits</h2>
            <div class="service-item"><span class="service-name">Portrait Session</span><span class="service-price">KSh 200 per digital photo</span></div>
            <div class="service-item"><span class="service-name">Stylistic/Creative</span><span class="service-price">KSh 250 per digital photo</span></div>
            <div class="service-item"><span class="service-name">Birthday Shoot</span><span class="service-price">KSh 180 per digital photo</span></div>
            <div class="service-item"><span class="service-name">Graduation</span><span class="service-price">KSh 220 per digital photo</span></div>
            <div class="service-item"><span class="service-name">Passport Photos</span><span class="service-price">KSh 100 per digital photo</span></div>
            <div class="service-item"><span class="service-name">Family Portrait</span><span class="service-price">KSh 300 per digital photo</span></div>
          </div>

          <!-- Print Sizes -->
          <div class="section">
            <h2>🖨️ Print Sizes</h2>
            <div class="service-item"><span class="service-name">A1 (Poster size)</span><span class="service-price">KSh 1,500</span></div>
            <div class="service-item"><span class="service-name">A2 (Large)</span><span class="service-price">KSh 1,000</span></div>
            <div class="service-item"><span class="service-name">A3 (Medium)</span><span class="service-price">KSh 500</span></div>
            <div class="service-item"><span class="service-name">A4 (Standard)</span><span class="service-price">KSh 300</span></div>
            <div class="service-item"><span class="service-name">A5 (Small)</span><span class="service-price">KSh 100</span></div>
          </div>

          <!-- Extras -->
          <div class="section">
            <h2>✨ Extras</h2>
            <div class="service-item"><span class="service-name">Makeup</span><span class="service-price">KSh 1,000</span></div>
            <div class="service-item"><span class="service-name">Gown</span><span class="service-price">KSh 2,000</span></div>
          </div>

          <div class="footer">
            <p>📞 +254 797 356 421 | 💬 WhatsApp Available | 📧 info@alakara.studio</p>
            <p class="contact">📍 Teachers Plaza, 2nd Floor Room 18, Kapenguria, Kenya</p>
            <p style="margin-top: 10px;">*Prices are subject to change. Travel fees may apply for remote locations.</p>
            <p>Generated on ${currentDate}</p>
          </div>
        </div>
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #C6A43F; border: none; border-radius: 8px; cursor: pointer;">Print / Save as PDF</button>
        </div>
        <script>
          // Auto-open print dialog
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
      </html>
    `;

    // Create blob and open in new tab
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, "_blank");
    if (newWindow) {
      newWindow.document.title = "Alakara Studios - Price List";
    }
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-lg hover:bg-amber-400 transition"
    >
      <FileText className="w-4 h-4" />
      Download Price List (PDF)
    </button>
  );
}