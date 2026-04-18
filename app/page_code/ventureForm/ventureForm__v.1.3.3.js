/**
 * VENTURE Form Page Code
 * Handles user input, validation, and dispatch to n8n workflow
 * Path: /pages/ventureForm.js
 * Version: [Venture Form: v1.3.3]
 */

import wixPay from 'wix-pay';
import wixLocation from 'wix-location';
import { createVenturePayment, verifyPaymentStatus } from 'backend/ventureServices/payment.web';
import { firePayloadToN8n } from 'backend/ventureServices/n8nManager.web';

const VERSION_TAG = '[Venture Form: v1.3.3]';

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

    //
    $w("firstName, lastName, deliveryEmail").customClass = "globalVentureInput";
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
    console.log(`${VERSION_TAG} [UX] Submission Initiated`);
    const btn = $w("#btnSubmit");
    btn.disable();
    btn.label = "Processing...";

    try {
        const payload = gatherVenturePayload();
        const payment = await createVenturePayment(149);
        
        console.log(`${VERSION_TAG} [UI] Opening Payment Modal...`);
        const result = await wixPay.startPayment(payment.id);
        
        console.log(`${VERSION_TAG} [UI] Modal Result: "${result.status}"`);

        // Inclusion of "Offline" (Manual Payment)
        if (["Successful", "Pending", "Offline"].includes(result.status)) {
            
            // Pass both ID and Status to the backend
            const verification = await verifyPaymentStatus(result.payment.id, result.status);
            
            if (verification.verified) {
                console.log(`${VERSION_TAG} [FLOW] Verified. Firing n8n pipeline...`);
                btn.label = "Synchronizing...";
                
                await firePayloadToN8n(payload);
                
                console.log(`${VERSION_TAG} [SUCCESS] Redirecting.`);
                wixLocation.to("/success");
            } else {
                throw new Error(`Verification Rejected: ${verification.status}`);
            }
        } else {
            console.log(`${VERSION_TAG} [EXIT] Status: ${result.status}`);
            resetBtn();
        }
    } catch (err) {
        console.error(`${VERSION_TAG} [CRITICAL]`, err.message);
        $w("#errorText").text = "Venture System Error: " + err.message;
        $w("#errorText").show();
        resetBtn();
    }
}

function showError(msg) {
    $w("#errorText").text = msg;
    $w("#errorText").show();
}

function resetBtn() {
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