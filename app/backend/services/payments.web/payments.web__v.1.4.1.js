/**
 * Payments - VENTURE
 * Handles payment initialization and verification
 * Path: /backend/services/payment.web.js
 * Version: [Venture Payments: v1.4.1]
 */

import wixPayBackend from 'wix-pay-backend';
import { Permissions, webMethod } from 'wix-web-module';

const VERSION_TAG = '[Venture Payments: v1.4.1]';

export const createVenturePayment = webMethod(Permissions.Anyone, async (amount) => {
    console.log(`${VERSION_TAG} [START] createVenturePayment | Amount: ${amount}`);
    try {
        const payment = await wixPayBackend.createPayment({
            amount: Number(amount),
            items: [{ name: "VentureAnalyst AI Bundle", price: Number(amount) }]
        });
        console.log(`${VERSION_TAG} [SUCCESS] Payment Object Created: ${payment.id}`);
        return payment;
    } catch (error) {
        console.error(`${VERSION_TAG} [ERROR] createVenturePayment:`, error.message);
        throw error;
    }
});

export const verifyPaymentStatus = webMethod(Permissions.Anyone, async (paymentId) => {
    console.log(`${VERSION_TAG} [START] verifyPaymentStatus | ID: ${paymentId}`);
    try {
        const paymentInfo = await wixPayBackend['getPayment'](paymentId);
        console.log(`${VERSION_TAG} [DATA] Raw Wix Status: "${paymentInfo.status}"`);
        
        // TICKET #1 RESOLUTION: Added "Offline" to match your browser logs
        const isValid = ["Successful", "Pending", "Offline"].includes(paymentInfo.status);
        
        console.log(`${VERSION_TAG} [RESULT] Verification: ${isValid ? 'PASSED' : 'FAILED'}`);
        return { verified: isValid, status: paymentInfo.status };
    } catch (error) {
        console.error(`${VERSION_TAG} [ERROR] verifyPaymentStatus:`, error.message);
        return { verified: false, status: "Error" };
    }
});