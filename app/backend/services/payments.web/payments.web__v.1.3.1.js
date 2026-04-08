/**
 * Payments - VENTURE
 * Handles payment initialization and verification
 * Path: /backend/services/payment.web.js
 * Version: [Venture Payments: v1.3.1]
 */

import wixPayBackend from 'wix-pay-backend';
import { Permissions, webMethod } from 'wix-web-module';

const VERSION_TAG = '[Venture Payments: v1.3.1]';

export const createVenturePayment = webMethod(Permissions.Anyone, async (amount) => {
    try {
        const paymentOptions = {
            amount: Number(amount),
            items: [{ 
                name: "VentureAnalyst AI: 3-Dossier Analysis", 
                price: Number(amount) 
            }]
        };
        return await wixPayBackend.createPayment(paymentOptions);
    } catch (error) {
        console.error("Venture Payment Creation Error:", error);
        throw new Error("Checkout currently unavailable.");
    }
});

export const verifyPaymentStatus = webMethod(Permissions.Anyone, async (paymentId) => {
    try {
        const paymentInfo = await wixPayBackend['getPayment'](paymentId);
        const isVerified = (paymentInfo.status === "Successful" || paymentInfo.status === "Pending");
        
        return {
            verified: isVerified,
            status: paymentInfo.status
        };
    } catch (error) {
        console.error("Venture Verification Error:", error);
        return { verified: false, status: "Error" };
    }
});