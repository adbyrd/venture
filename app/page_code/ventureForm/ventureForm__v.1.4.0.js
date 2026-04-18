/**
 * VENTURE Form Page Code
 * Handles user input, validation, and dispatch to n8n workflow
 * Path: /pages/ventureForm.js
 * Version: [Venture Form: v1.4.0]
 */

import wixPay from 'wix-pay';
import wixLocation from 'wix-location';
import { createVenturePayment, verifyPaymentStatus } from 'backend/ventureServices/payment.web';
import { firePayloadToN8n } from 'backend/ventureServices/n8nManager.web';

const VERSION_TAG = '[Venture Form: v1.4.0]';
const STATES = ["details", "core", "market", "tactical", "reality", "payment"];
let currentStateIndex = 0;

const STATE_INPUTS = {
    "details": ["#firstName", "#lastName", "#deliveryEmail"],
    "core": ["#companyName", "#companyPitch", "#companyRevenue", "#companyAdvantage", "#companyInventory"],
    "market": ["#targetCategory", "#alternatives", "#pricePoint", "#frictionPoints"],
    "tactical": ["#salesChannel", "#growthLever", "#geography"],
    "reality": ["#killCriteria", "#biggestFear", "#bottleneck"]
};

$w.onReady(function () {
    updateNavigationUI();

    // Next Button Logic with Ticket #4 Validation
    $w("#btnNext").onClick(() => {
        if (validateCurrentState()) {
            if (currentStateIndex < STATES.length - 1) {
                currentStateIndex++;
                $w("#ventureForm").changeState(STATES[currentStateIndex]);
                updateNavigationUI();
            }
        } else {
            showErrorToaster("Please correct the fields below");
        }
    });

    $w("#btnBack").onClick(() => {
        if (currentStateIndex > 0) {
            currentStateIndex--;
            $w("#ventureForm").changeState(STATES[currentStateIndex]);
            updateNavigationUI();
        }
    });

    $w("#btnSubmit").onClick(async () => {
        // Final validation check before payment
        if (validateCurrentState()) {
            await handleCheckoutAndSubmission();
        } else {
            showErrorToaster("Please correct the fields below");
        }
    });
});

function validateCurrentState() {
    const currentState = STATES[currentStateIndex];
    const inputsToValidate = STATE_INPUTS[currentState];

    // If the state isn't in our map (like "payment"), assume valid
    if (!inputsToValidate) return true;

    let isValid = true;

    inputsToValidate.forEach(selector => {
        const input = $w(selector);
        // Force-trigger the visual UI error state if invalid
        if (!input.valid) {
            input.updateValidityIndication();
            isValid = false;
        }
    });

    return isValid;
}

function updateNavigationUI() {
    const isFirstState = currentStateIndex === 0;
    const isLastState = currentStateIndex === STATES.length - 1;

    // Handle "Back" button visibility: Hidden on state 1 (index 0), visible otherwise
    isFirstState ? $w("#btnBack").hide() : $w("#btnBack").show();

    // Handle "Next" vs "Submit" visibility
    if (isLastState) {
        $w("#btnNext").hide();
        $w("#btnSubmit").show();
    } else {
        $w("#btnNext").show();
        $w("#btnSubmit").hide();
    }
}

async function handleCheckoutAndSubmission() {
    console.log(`${VERSION_TAG} [UX] Submission Initiated`);
    const btn = $w("#btnSubmit");
    
    btn.disable();
    btn.label = "Processing...";
    $w("#btnBack").disable(); 

    try {
        const payload = gatherVenturePayload();
        const payment = await createVenturePayment(149);
        
        const result = await wixPay.startPayment(payment.id);
        
        if (["Successful", "Pending", "Offline"].includes(result.status)) {
            const verification = await verifyPaymentStatus(result.payment.id, result.status);
            
            if (verification.verified) {
                btn.label = "Synchronizing...";
                await firePayloadToN8n(payload);
                wixLocation.to("/success");
            } else {
                throw new Error(`Verification Rejected: ${verification.status}`);
            }
        } else {
            resetBtn();
        }
    } catch (err) {
        console.error(`${VERSION_TAG} [CRITICAL]`, err.message);
        showErrorToaster(err.message); // Trigger the new error UI logic
        resetBtn();
    }
}

async function showErrorToaster(msg) {
    $w("#errorMessage").text = `Venture System Error: ${msg}`;
    
    // Show the section
    await $w("#errorSection").expand();
    
    // Wait for 4 seconds (4000ms)
    setTimeout(async () => {
        await $w("#errorSection").collapse();
    }, 4000);
}

function resetBtn() {
    $w("#btnSubmit").enable();
    $w("#btnBack").enable();
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
        targetCategory: $w("#targetCategory").value,
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