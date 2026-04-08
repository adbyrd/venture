/**
 * VENTURE Form Page Code
 * Handles user input, validation, and dispatch to n8n workflow
 * Path: /pages/ventureForm.js
 * Version: [Venture Form: v1.2.1]
 */

import wixPay from 'wix-pay';
import wixLocation from 'wix-location';
import { createVenturePayment, verifyPaymentStatus } from 'backend/ventureServices/payment.web';
import { firePayloadToN8n } from 'backend/ventureServices/n8nManager.web';

const VERSION_TAG = '[Venture Form: v1.2.1]';
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

function updateNavigationUI() {
    const isLastState = currentStateIndex === STATES.length - 1;
    const isFirstState = currentStateIndex === 0;

    if (isLastState) {
        $w("#btnNext").hide();
        $w("#btnSubmit").show();
    } else {
        $w("#btnNext").show();
        $w("#btnSubmit").hide();
    }

    isFirstState ? $w("#btnCancel").hide() : $w("#btnCancel").show();
}

async function handleCheckoutAndSubmission() {
    $w("#errorText").hide();
    const btn = $w("#btnSubmit");
    
    try {
        const payload = gatherVenturePayload(); 
        const payment = await createVenturePayment(149);
        
        // This opens the modal where user selects "Cash/Manual"
        const result = await wixPay.startPayment(payment.id);
        
        // result.status will be "Pending" for Manual Payments
        if (result.status === "Successful" || result.status === "Pending") {
            const paymentId = result.payment.id;
            
            // Backend double-check
            const verification = await verifyPaymentStatus(paymentId);
            
            if (verification.verified) {
                btn.label = "Syncing with n8n...";
                
                // Trigger n8n pipeline
                await firePayloadToN8n(payload);
                
                // Redirect to Success/Confirmation
                wixLocation.to("/success"); 
            } else {
                throw new Error(`Payment status: ${verification.status}`);
            }
        } else if (result.status === "Cancelled") {
            btn.enable();
            btn.label = "Begin Processing";
            showError("Transaction cancelled.");
        }
    } catch (err) {
        btn.enable();
        btn.label = "Try Again";
        showError("Venture Protocol Interrupted: " + err.message);
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