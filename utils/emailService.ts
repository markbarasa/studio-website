import { Resend } from "resend";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email (update with your verified domain)
const FROM_EMAIL = "Studio Booking <onboarding@resend.dev>";

export interface Booking {
  id: number;
  name: string;
  email?: string;
  phone: string;
  service: string;
  package: string;
  price: number;
  deposit: number;
  date: string;
  venue?: string;
  status: string;
  paymentStatus: string;
}

// HTML template for booking confirmation (inline styles)
const getBookingConfirmationHTML = (booking: Booking) => {
  const balance = booking.price - booking.deposit;
  const formattedDate = new Date(booking.date).toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px 0 48px; }
        .header { background-color: #000000; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; }
        .header p { color: #a3a3a3; font-size: 16px; margin: 8px 0 0; }
        .content { padding: 0 40px; }
        .greeting { font-size: 18px; margin: 24px 0; }
        .paragraph { font-size: 16px; line-height: 1.5; color: #333333; margin: 16px 0; }
        .section { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .payment-section { background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { margin: 12px 0; }
        .detail-label { font-size: 14px; color: #666666; width: 120px; display: inline-block; }
        .detail-value { font-size: 16px; font-weight: bold; color: #000000; }
        .balance { color: #dc2626; }
        .reminder { background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center; }
        .reminder p { font-size: 14px; color: #92400e; margin: 0; }
        .button { text-align: center; margin: 32px 0; }
        .button a { background-color: #000000; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 12px 24px; }
        hr { border-color: #e5e7eb; margin: 32px 0; }
        .footer { color: #666666; font-size: 12px; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed</h1>
          <p>Booking #${booking.id}</p>
        </div>
        <div class="content">
          <div class="greeting">Dear ${booking.name},</div>
          <div class="paragraph">Thank you for choosing our services! Your booking has been successfully confirmed.</div>
          
          <div class="section">
            <h2 style="font-size: 20px; margin: 0 0 16px;">Booking Details</h2>
            <div class="detail-row"><span class="detail-label">Service:</span> <span class="detail-value">${booking.service}</span></div>
            <div class="detail-row"><span class="detail-label">Package:</span> <span class="detail-value">${booking.package}</span></div>
            <div class="detail-row"><span class="detail-label">Event Date:</span> <span class="detail-value">${formattedDate}</span></div>
          </div>
          
          <div class="payment-section">
            <h2 style="font-size: 20px; margin: 0 0 16px;">Payment Summary</h2>
            <div class="detail-row"><span class="detail-label">Total Amount:</span> <span class="detail-value">KSh ${booking.price.toLocaleString()}</span></div>
            <div class="detail-row"><span class="detail-label">Deposit Paid:</span> <span class="detail-value">KSh ${booking.deposit.toLocaleString()}</span></div>
            ${balance > 0 ? `<div class="detail-row"><span class="detail-label">Remaining:</span> <span class="detail-value balance">KSh ${balance.toLocaleString()}</span></div>` : ''}
          </div>
          
          ${balance > 0 ? `
          <div class="reminder">
            <p>💳 Please complete the remaining payment before the event date.</p>
          </div>
          ` : ''}
          
          <div class="button">
            <a href="https://yourstudio.com/portal/${booking.id}">View Booking Details</a>
          </div>
          
          <hr />
          <div class="footer">Need help? Call us at 📞 +254 797 356421</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// HTML template for payment receipt
const getPaymentReceiptHTML = (booking: Booking, amount: number, method: string, reference: string) => {
  const totalPaid = (booking.deposit || 0) + amount;
  const remainingBalance = booking.price - totalPaid;
  const formattedDate = new Date().toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px 0 48px; }
        .header { background-color: #059669; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; }
        .header p { color: #d1fae5; font-size: 16px; margin: 8px 0 0; }
        .content { padding: 0 40px; }
        .amount { font-size: 20px; font-weight: bold; color: #059669; }
        .success { color: #059669; font-weight: bold; }
        hr { border-color: #e5e7eb; margin: 32px 0; }
        .footer { color: #666666; font-size: 12px; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Receipt</h1>
          <p>Booking #${booking.id}</p>
        </div>
        <div class="content">
          <p>Dear ${booking.name},</p>
          <p>We have received your payment of <strong>KSh ${amount.toLocaleString()}</strong> for your ${booking.service} booking.</p>
          
          <h2>Payment Details</h2>
          <p><strong>Amount:</strong> <span class="amount">KSh ${amount.toLocaleString()}</span></p>
          <p><strong>Method:</strong> ${method.toUpperCase()}</p>
          <p><strong>Reference:</strong> ${reference}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          
          <h2>Payment Summary</h2>
          <p><strong>Total:</strong> KSh ${booking.price.toLocaleString()}</p>
          <p><strong>Total Paid:</strong> <span class="success">KSh ${totalPaid.toLocaleString()}</span></p>
          ${remainingBalance > 0 ? `<p><strong>Remaining:</strong> KSh ${remainingBalance.toLocaleString()}</p>` : '<p><strong>Status:</strong> <span class="success">FULLY PAID ✅</span></p>'}
          
          <hr />
          <div class="footer">Thank you for your payment! For questions, call +254 797 356421</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// HTML template for event reminder
const getEventReminderHTML = (booking: Booking) => {
  const remainingBalance = booking.price - (booking.deposit || 0);
  const formattedDate = new Date(booking.date).toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Event Reminder</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px 0 48px; }
        .header { background-color: #3b82f6; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; }
        .event-details { background-color: #eff6ff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .event-date { font-size: 18px; font-weight: bold; color: #1e40af; }
        .reminder { background-color: #fef3c7; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
        .checklist { background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .button { text-align: center; margin: 32px 0; }
        .button a { background-color: #3b82f6; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 12px 24px; }
        hr { border-color: #e5e7eb; margin: 32px 0; }
        .footer { color: #666666; font-size: 12px; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Event Reminder</h1>
          <p>Booking #${booking.id}</p>
        </div>
        <div class="content">
          <p>Dear ${booking.name},</p>
          <p>This is a reminder about your upcoming ${booking.service} event.</p>
          
          <div class="event-details">
            <div class="event-date">📅 ${formattedDate}</div>
            ${booking.venue ? `<div>📍 ${booking.venue}</div>` : ''}
            <div>🎬 ${booking.service}</div>
          </div>
          
          ${remainingBalance > 0 ? `
          <div class="reminder">
            <p><strong>⚠️ Remaining Balance: KSh ${remainingBalance.toLocaleString()}</strong></p>
            <p>Please clear any outstanding balance before or on the event day.</p>
          </div>
          ` : ''}
          
          <div class="checklist">
            <h3>What to Expect:</h3>
            <p>✓ Our team will arrive 30 minutes before scheduled time</p>
            <p>✓ Final walkthrough and shot list review</p>
            <p>✓ Share any last-minute changes or requests</p>
            <p>✓ Prepare payment for any remaining balance</p>
          </div>
          
          <div class="button">
            <a href="https://yourstudio.com/portal/${booking.id}">View Full Details</a>
          </div>
          
          <hr />
          <div class="footer">Questions? Call us at 📞 +254 797 356421</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const EmailService = {
  async sendBookingConfirmation(booking: Booking): Promise<boolean> {
    if (!booking.email) return false;

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [booking.email],
        subject: `Booking Confirmed - ${booking.service} on ${new Date(booking.date).toLocaleDateString()}`,
        html: getBookingConfirmationHTML(booking),
      });

      if (error) {
        console.error("Error sending booking confirmation:", error);
        return false;
      }

      console.log("Booking confirmation sent:", data?.id);
      return true;
    } catch (error) {
      console.error("Failed to send booking confirmation:", error);
      return false;
    }
  },

  async sendPaymentReceipt(
    booking: Booking,
    amount: number,
    method: string,
    reference: string
  ): Promise<boolean> {
    if (!booking.email) return false;

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [booking.email],
        subject: `Payment Receipt - KSh ${amount.toLocaleString()} received`,
        html: getPaymentReceiptHTML(booking, amount, method, reference),
      });

      if (error) {
        console.error("Error sending payment receipt:", error);
        return false;
      }

      console.log("Payment receipt sent:", data?.id);
      return true;
    } catch (error) {
      console.error("Failed to send payment receipt:", error);
      return false;
    }
  },

  async sendEventReminder(booking: Booking): Promise<boolean> {
    if (!booking.email) return false;

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [booking.email],
        subject: `Reminder: Your ${booking.service} is coming up!`,
        html: getEventReminderHTML(booking),
      });

      if (error) {
        console.error("Error sending event reminder:", error);
        return false;
      }

      console.log("Event reminder sent:", data?.id);
      return true;
    } catch (error) {
      console.error("Failed to send event reminder:", error);
      return false;
    }
  },

  async testEmail(to: string): Promise<boolean> {
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: "Test Email from Studio Booking System",
        html: "<h1>Test Successful!</h1><p>Your email configuration is working correctly.</p>",
      });

      if (error) {
        console.error("Test email failed:", error);
        return false;
      }

      console.log("Test email sent:", data?.id);
      return true;
    } catch (error) {
      console.error("Failed to send test email:", error);
      return false;
    }
  },
};

export default EmailService;