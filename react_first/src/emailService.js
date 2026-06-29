import emailjs from '@emailjs/browser';

// To use EmailJS to send real OTPs, replace these with your actual credentials
// from https://www.emailjs.com/
const EMAILJS_SERVICE_ID = "service_f3ty4o2";
const EMAILJS_TEMPLATE_ID = "template_u4k9jgb";
const EMAILJS_PUBLIC_KEY = "1y4jxFdYPVIlt-gaL";

export const sendOTPEmail = async (email, otp) => {
  // Demo fallback when no provider keys are configured
  if (EMAILJS_SERVICE_ID !== "service_f3ty4o2") {
    console.warn("EmailJS not configured yet. Using demo OTP alert.");
    alert(`📧 [DEMO OTP ALERT]\nSent to: ${email}\nOTP: ${otp}\n\n(Configure EmailJS credentials in emailService.js to send real emails)`);
    return { success: true };
  }

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        email: email,
        otp_message: `Your verification OTP is: ${otp}`,
        reply_to: "chavansheetal0908@gmail.com"
      },
      EMAILJS_PUBLIC_KEY
    );

    console.log("Email successfully sent!", response.status, response.text);
    return { success: true, response };
  } catch (error) {
    console.error("EmailJS error:", error);
    return { success: false, error };
  }
};

export const sendApplicationConfirmationEmail = async (studentEmail, details) => {
  // Demo fallback
  if (EMAILJS_SERVICE_ID !== "service_f3ty4o2") {
    console.warn("EmailJS not configured yet. Using demo confirmation alert.");
    alert(`📧 [DEMO EMAIL SENT]\nTo: ${studentEmail}\n\nDear Student,\n\nGreetings from the Scholarship Portal.\n\nYour scholarship application has been successfully submitted. Below are your application details:\n\nApplication ID: ${details.appId}\nApplicant Name: ${details.studentName}\nScholarship Scheme: ${details.scheme}\nSubmission Date: ${details.date}\n\nYour application is now under review by the concerned authorities.\n\nRegards,\nScholarship Portal Team`);
    return { success: true };
  }

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      "template_application", // Updated to match user's EmailJS Template ID
      {
        to_email: studentEmail,
        student_name: details.studentName,
        app_id: details.appId,
        scheme_name: details.scheme,
        submission_date: details.date,
        reply_to: "chavansheetal0908@gmail.com"
      },
      EMAILJS_PUBLIC_KEY
    );

    console.log("Confirmation email sent!", response.status, response.text);
    return { success: true, response };
  } catch (error) {
    console.error("EmailJS confirmation error:", error);
    return { success: false, error };
  }
};