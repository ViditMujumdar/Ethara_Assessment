import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import logger from './logger.js';

let transporter = null;

const getTransporter = () => {
  if (!transporter && config.email.host) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: { user: config.email.user, pass: config.email.pass },
    });
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transport = getTransporter();
  if (!transport) {
    logger.warn(`Email not sent (SMTP not configured): ${subject} -> ${to}`);
    return { mock: true };
  }
  return transport.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
    text,
  });
};

export const sendVerificationEmail = async (user, token) => {
  const url = `${config.clientUrl}/verify-email?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Verify your TaskFlow account',
    html: `<p>Hi ${user.name},</p><p><a href="${url}">Verify your email</a></p>`,
  });
};

export const sendPasswordResetEmail = async (user, token) => {
  const url = `${config.clientUrl}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Reset your TaskFlow password',
    html: `<p>Hi ${user.name},</p><p><a href="${url}">Reset password</a> (expires in 1 hour)</p>`,
  });
};

export default sendEmail;
