// utils/emailService.ts
import { Booking } from "@/types";

type EmailTemplate = {
  subject: string;
  body: string;
};

export class EmailService {
  // Simulate email sending (replace with actual email API)
  static async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    console.log(`Sending email to ${to}:`, template);
    // In production, use SendGrid, Mailgun, AWS SES, etc.
    return true;
  }

  static getBookingConfirmation(booking: Booking): EmailTemplate {
    return {
      subject: `Booking Confirmed - ${booking.service} on ${booking.date}`,
      body: `
        Dear ${booking.name},

        Your booking has been confirmed!

        📅 Date: ${booking.date}
        🎬 Service: ${booking.service}
        📦 Package: ${booking.package}
        💰 Price: KSh ${booking.price.toLocaleString()}
        💳 Deposit Paid: KSh ${booking.deposit.toLocaleString()}
        💵 Balance: KSh ${(booking.price - booking.deposit).toLocaleString()}

        We'll contact you 24 hours before the event.

        Best regards,
        Studio Team
      `,
    };
  }

  static getPaymentReceipt(booking: Booking, amount: number): EmailTemplate {
    return {
      subject: `Payment Received - KSh ${amount.toLocaleString()}`,
      body: `
        Dear ${booking.name},

        Payment received: KSh ${amount.toLocaleString()}
        
        Booking: ${booking.service} - ${booking.package}
        Date: ${booking.date}
        Remaining Balance: KSh ${(booking.price - booking.deposit).toLocaleString()}

        Thank you!
      `,
    };
  }

  static getEventReminder(booking: Booking): EmailTemplate {
    return {
      subject: `Reminder: Your event is tomorrow!`,
      body: `
        Dear ${booking.name},

        Quick reminder about your event tomorrow!

        📅 Date: ${booking.date}
        🎬 Service: ${booking.service}
        
        Please ensure:
        ✓ Venue is accessible
        ✓ Contact person is available
        ✓ Any special requests are communicated

        See you soon!
      `,
    };
  }

  static getThankYou(booking: Booking): EmailTemplate {
    return {
      subject: `Thank you for choosing us!`,
      body: `
        Dear ${booking.name},

        Thank you for choosing our services!

        We'd love to hear your feedback.

        Would you recommend us? ⭐⭐⭐⭐⭐

        Best regards,
        Studio Team
      `,
    };
  }
}