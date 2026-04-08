/**
 * VENTURE Form Page Code
 * Handles user input, validation, and dispatch to n8n workflow
 * Path: /pages/ventureForm.js
 * Version: [Venture Form: v1.2.0]
 */

import wixPay from 'wix-pay';
import wixLocation from 'wix-location';
import { createVenturePayment, verifyPaymentStatus } from 'backend/ventureServices/payment.web';
import { firePayloadToN8n } from 'backend/ventureServices/n8nManager.web';

const VERSION_TAG = '[Venture Form: v1.2.0]';

const MSG_VALIDATION_ERROR = "Please complete all required fields.";
const MSG_PROTOCOL_ERROR = "This field is required for the Venture protocol.";
const MSG_SYSTEM_ERROR = "Venture Interrupted: ";

const STATES = ["details", "core", "market", "tactical", "reality", "payment"];
let currentStateIndex = 0;

$w.onReady(function () {
    updateNavigationUI();

    $w("#btnNext").onClick(() => {
        if (currentStateIndex < STATES.length - 1) {
            currentStateIndex++;
            $w("#ventureForm").changeState(STATES[currentStateIndex]);
            updateNavigationUI();
        }
    });

    $w("#btnCancel").onClick(() => {
        if (currentStateIndex > 0) {
            currentStateIndex--;
            $w("#ventureForm").changeState(STATES[currentStateIndex]);
            updateNavigationUI();
        }
    });

    $w("#btnSubmit").onClick(async () => {
        $w("#btnSubmit").disable();
        $w("#btnSubmit").label = "Processing...";
        
        await handleCheckoutAndSubmission();
    });
});

/**
 * Manages the visibility of navigation buttons and the Submit/Payment trigger.
 */
function updateNavigationUI() {
    const isLastState = currentStateIndex === STATES.length - 1;
    const isFirstState = currentStateIndex === 0;

    // Show/Hide buttons based on position in the funnel [cite: 100]
    if (isLastState) {
        $w("#btnNext").hide();
        $w("#btnSubmit").show();
    } else {
        $w("#btnNext").show();
        $w("#btnSubmit").hide();
    }

    isFirstState ? $w("#btnCancel").hide() : $w("#btnCancel").show();
}

/**
 * The core logic requested: Payment acts as the flag for n8n submission.
 */
async function handleCheckoutAndSubmission() {
    try {
        const payload = gatherVenturePayload(); 
        
        // 1. Create Payment
        const payment = await createVenturePayment(149);
        
        // 2. Trigger the Payment UI
        // result is of type PaymentResult
        const result = await wixPay.startPayment(payment.id);
        
        /**
         * FIX: In Wix Velo, the PaymentResult object structure is:
         * { status: "Successful", payment: { id: "..." } }
         * 'paymentId' does not exist directly on result.
         */
        if (result.status === "Successful") {
            const actualId = result.payment.id; // Correct way to access the ID
            
            // 3. Server-side check (The 'Flag' for n8n)
            const isPaid = await verifyPaymentStatus(actualId);
            
            if (isPaid) {
                await firePayloadToN8n(payload);
                wixLocation.to("/success");
            }
        } else if (result.status === "Cancelled") {
            $w("#errorText").text = "Payment was cancelled. You won't be charged.";
            $w("#errorText").show();
        }
    } catch (err) {
        // This catches "Pending" or "Failed" statuses and system errors
        $w("#errorText").text = "Payment Error: " + err.message;
        $w("#errorText").show();
        $w("#btnSubmit").enable();
        $w("#btnSubmit").label = "Try Again";
    }
}

function gatherVenturePayload() {
    return {
        // DETAILS
        firstName: $w("#firstName").value,
        lastName: $w("#lastName").value,
        deliveryEmail: $w("#deliveryEmail").value,

        // CORE
        companyName: $w("#companyName").value,
        companyPitch: $w("#companyPitch").value,
        companyRevenue: $w("#companyRevenue").value,
        companyAdvantage: $w("#companyAdvantage").value,
        companyInventory: $w("#companyInventory").value,

        // MARKET
        targetCategory: $w("#targetCatgory").value,
        alternatives: $w("#alternatives").value,
        pricePoint: $w("#pricePoint").value,
        frictionPoints: $w("#frictionPoints").value,

        // TACTICAL
        salesChannel: $w("#salesChannel").value,
        growthLever: $w("#growthLever").value,
        geography: $w("#geography").value,

        // VARIABLES
        killCriteria: $w("#killCriteria").value,
        biggestFear: $w("#biggestFear").value,
        bottleneck: $w("#bottleneck").value
    };
}