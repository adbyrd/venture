/**
 * VENTURE Form Page Code
 * Handles user input, validation, and dispatch to n8n workflow
 * Path: /pages/ventureForm.js
 * Version: [Venture Form: v1.2.2]
 */

import wixPay from 'wix-pay';
import wixLocation from 'wix-location';
import { createVenturePayment, verifyPaymentStatus } from 'backend/ventureServices/payment.web';
import { firePayloadToN8n } from 'backend/ventureServices/n8nManager.web';

const VERSION_TAG = '[Venture Form: v1.2.2]';
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
    const submitBtn = $w("#btnSubmit");
    
    try {
        const payload = gatherVenturePayload(); 
        
        // 1. Create Payment Object
        const payment = await createVenturePayment(149);
        
        // 2. Open Modal (User selects "Cash Payment" here)
        const result = await wixPay.startPayment(payment.id);
        
        /**
         * FIX: In Velo, ID is result.payment.id.
         * Manual payments return result.status === "Pending".
         */
        if (result.status === "Successful" || result.status === "Pending") {
            const actualId = result.payment.id; 
            
            // 3. Verify on backend (The 'Payment Flag')
            const verification = await verifyPaymentStatus(actualId);
            
            if (verification.verified) {
                submitBtn.label = "Initiating Analysis...";
                
                // 4. Trigger n8n pipeline
                await firePayloadToN8n(payload);
                
                // Move to success page
                wixLocation.to("/success");
            } else {
                throw new Error(`Verification failed. Status: ${verification.status}`);
            }
        } else if (result.status === "Cancelled") {
            showError("Transaction cancelled. No charges were made.");
            resetSubmitButton();
        }
    } catch (err) {
        showError("System Error: " + err.message);
        resetSubmitButton();
    }
}

function showError(msg) {
    $w("#errorText").text = msg;
    $w("#errorText").show();
}

function resetSubmitButton() {
    $w("#btnSubmit").enable();
    $w("#btnSubmit").label = "Begin Processing";
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