import wixPayBackend from 'wix-pay-backend';
import { firePayloadToN8n } from './n8nManager.jsw';

/**
 * Creates a payment object for the one-time fee
 * @param {string} amount - Fixed price ($149 or $199) [cite: 72]
 */
export async function createPayment(amount) {
    const paymentInfo = {
        amount: amount,
        items: [{ name: "VentureAnalyst AI - 3 Dossier Bundle", price: amount }]
    };
    return wixPayBackend.createPayment(paymentInfo);
}

/**
 * Verifies payment and triggers n8n pipeline
 * @param {string} paymentId 
 * @param {object} payloadData - The gathered business data
 */
export async function handlePaymentResult(paymentId, payloadData) {
    const paymentResult = await wixPayBackend.getPayment(paymentId);
    
    if (paymentResult.status === "Successful") {
        // The "Payment Flag" is confirmed; proceed to automation [cite: 137]
        return await firePayloadToN8n(payloadData);
    } else {
        throw new Error("Payment verification failed or was cancelled.");
    }
}