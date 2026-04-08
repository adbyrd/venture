/**
 * Payments - VENTURE
 * Handles payment initialization and verification
 * Path: /backend/services/payment.web.js
 * Version: [Venture Payments: v1.2.1]
 */

import wixPayBackend from 'wix-pay-backend';
import { Permissions, webMethod } from 'wix-web-module';

const VERSION_TAG = '[Venture Payments: v1.2.1]';

/**
 * Creates a payment object
 */
export const createVenturePayment = webMethod(Permissions.Anyone, async (amount) => {
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
        console.error("VentureAnalyst Payment Error:", error);
        throw new Error("Could not initialize checkout.");
    }
});

/**
 * FIXED: Validates the payment status. 
 * Note: Ensure the "Wix Pay" App is installed in your site dashboard.
 */
export const verifyPaymentStatus = webMethod(Permissions.Anyone, async (paymentId) => {
    try {
        // Correct method access for wix-pay-backend
        const paymentInfo = await wixPayBackend.getPayment(paymentId);
        return paymentInfo.status === "Successful";
    } catch (error) {
        console.error("Verification Error:", error);
        return false;
    }
});