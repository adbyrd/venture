/**
 * Payments - VENTURE
 * Handles payment initialization and verification
 * Path: /backend/services/payment.web.js
 * Version: [Venture Payments: v1.4.0]
 */

import wixPayBackend from 'wix-pay-backend';
import { Permissions, webMethod } from 'wix-web-module';

const VERSION_TAG = '[Venture Payments: v1.4.0]';

export const createVenturePayment = webMethod(Permissions.Anyone, async (amount) => {
    console.log(`${VERSION_TAG} Entering createVenturePayment. Amount:`, amount);
    try {
        const paymentOptions = {
            amount: Number(amount),
            items: [{ 
                name: "VentureAnalyst AI: 3-Dossier Analysis", 
                price: Number(amount) 
            }]
        };
        const payment = await wixPayBackend.createPayment(paymentOptions);
        console.log(`${VERSION_TAG} Payment object created successfully. ID: ${payment.id}`);
        return payment;
    } catch (error) {
        console.error(`${VERSION_TAG} FAILED to create payment:`, error.message);
        throw new Error("Checkout currently unavailable.");
    }
});

export const verifyPaymentStatus = webMethod(Permissions.Anyone, async (paymentId) => {
    console.log(`${VERSION_TAG} Initiating backend verification for ID: ${paymentId}`);
    try {
        // Bracket notation used to bypass IDE type-checker issues
        const paymentInfo = await wixPayBackend['getPayment'](paymentId);
        console.log(`${VERSION_TAG} Raw payment status from Wix:`, paymentInfo.status);
        
        const isVerified = (paymentInfo.status === "Successful" || paymentInfo.status === "Pending");
        
        if (isVerified) {
            console.log(`${VERSION_TAG} Verification PASSED. Status: ${paymentInfo.status}`);
        } else {
            console.warn(`${VERSION_TAG} Verification REJECTED. Status: ${paymentInfo.status}`);
        }

        return {
            verified: isVerified,
            status: paymentInfo.status
        };
    } catch (error) {
        console.error(`${VERSION_TAG} CRITICAL error during verification:`, error.message);
        return { verified: false, status: "Error" };
    }
});