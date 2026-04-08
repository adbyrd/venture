/**
 * Payments - VENTURE
 * Handles payment initialization and verification
 * Path: /backend/services/payment.web.js
 * Version: [Venture Payments: v1.1.0]
 */

import wixPayBackend from 'wix-pay-backend';
import { Permissions, webMethod } from 'wix-web-module';

const VERSION_TAG = '[Venture Payments: v1.1.0]';
/**
 * Creates a payment object for the VentureAnalyst AI report bundle.
 * Designed for the "One-Time Fee" model. [cite: 21, 72]
 */
export const createVenturePayment = webMethod(Permissions.Everyone, async (amount) => {
    const paymentOptions = {
        amount: amount,
        items: [{ 
            name: "VentureAnalyst AI: 3-Dossier Analysis", 
            price: amount 
        }]
    };
    
    try {
        return await wixPayBackend.createPayment(paymentOptions);
    } catch (error) {
        console.error("Payment Creation Error:", error);
        throw new Error("Could not initialize checkout. Please try again.");
    }
});

/**
 * Validates that the payment was successful before allowing automation to fire.
 */
export const verifyPaymentStatus = webMethod(Permissions.Everyone, async (paymentId) => {
    const payment = await wixPayBackend.getPayment(paymentId);
    return payment.status === "Successful";
});