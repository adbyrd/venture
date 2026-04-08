/**
 * VENTURE Form Page Code
 * Handles user input, validation, and dispatch to n8n workflow
 * Path: /pages/ventureForm.js
 * Version: [Venture Form: v1.3.0]
 */

import wixPay from 'wix-pay';
import wixLocation from 'wix-location';
import { createVenturePayment, verifyPaymentStatus } from 'backend/ventureServices/payment.web';
import { firePayloadToN8n } from 'backend/ventureServices/n8nManager.web';

const VERSION_TAG = '[Venture Form: v1.3.0]';
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
    console.log(`${VERSION_TAG} handleCheckoutAndSubmission triggered.`);
    $w("#errorText").hide();
    const submitBtn = $w("#btnSubmit");
    
    try {
        const payload = gatherVenturePayload(); 
        console.log(`${VERSION_TAG} Payload gathered:`, payload);
        
        console.log(`${VERSION_TAG} Calling createVenturePayment...`);
        const payment = await createVenturePayment(149);
        
        console.log(`${VERSION_TAG} Launching startPayment modal for ID: ${payment.id}`);
        const result = await wixPay.startPayment(payment.id);
        
        console.log(`${VERSION_TAG} Modal closed. Result Status: ${result.status}`);

        if (result.status === "Successful" || result.status === "Pending") {
            const actualId = result.payment.id; 
            console.log(`${VERSION_TAG} Proceeding with ID: ${actualId}`);
            
            console.log(`${VERSION_TAG} Calling verifyPaymentStatus...`);
            const verification = await verifyPaymentStatus(actualId);
            
            if (verification.verified) {
                console.log(`${VERSION_TAG} Backend confirmed payment. Dispatching to n8n...`);
                submitBtn.label = "Initiating Analysis...";
                
                const n8nResult = await firePayloadToN8n(payload);
                console.log(`${VERSION_TAG} n8n Dispatch success:`, n8nResult.success);
                
                console.log(`${VERSION_TAG} Redirecting to /success`);
                wixLocation.to("/success");
            } else {
                throw new Error(`Verification failed. Status: ${verification.status}`);
            }
        } else if (result.status === "Cancelled") {
            console.warn(`${VERSION_TAG} User cancelled the payment modal.`);
            showError("Transaction cancelled. No charges were made.");
            resetSubmitButton();
        }
    } catch (err) {
        console.error(`${VERSION_TAG} EXCEPTION in handleCheckoutAndSubmission:`, err.message);
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
    console.log(`${VERSION_TAG} Submit button reset to default.`);
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