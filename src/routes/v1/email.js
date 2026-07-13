import { Router } from "express";
import { Resend } from "resend";
import { RESEND_API_KEY, SENDER_MAIL, SUPPORT_MAIL } from "../../../config.js";

const emailRouter = Router();
const resend = new Resend(RESEND_API_KEY);

emailRouter.post("/contact", async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        const supportMail = await resend.emails.send({
            from: `Contact Form <onboarding@resend.dev>`,
            to: [SUPPORT_MAIL],
            subject: `CONTACT_US_MAIL: ${subject}`,
            reply_to: email,
            html: `
                <h2>New Contact Message</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || "N/A"}</p>
                <hr />
                <p>${message}</p>
            `
        });

        if (supportMail.error) {
            return res.status(400).json({
                error: supportMail.error,
            });
        }

        await resend.emails.send({
            from: `Support <${SENDER_MAIL}>`,
            to: [email],
            subject: `We received your message: ${subject}`,
            html: `
                <p>Hi ${name},</p>
                <p>Thanks for contacting us! We have received your message and will get back to you shortly.</p>
                <br />
                <p>Support Team</p>
            `
        });

        return res.status(200).json({
            success: true,
            message: "emails sent successfully",
        });

    } catch (err) {
        console.error("Email error:", err);
        return res.status(500).json({
            message: "Failed to send email",
        });
    }
});

export default emailRouter;
