/**
 * VENTURE Form Page Code
 * Handles user input, validation, and dispatch to n8n workflow
 * Path: /pages/ventureForm.js
 * Version: [Venture Form: v1.0.1]
 */

import { formatVenturePayload } from 'public/utils/formatters';
import { sendPayloadToWorkflow } from 'backend/services/n8nManager.web';
import { createPayment, handlePaymentResult } from 'backend/services/payment.jsw';
import wixPay from 'wix-pay';
import wixLocation from 'wix-location';

const VERSION_TAG = '[Venture Form: v1.0.1]';
const MSG_VALIDATION_ERROR = "Please complete all required fields.";
const MSG_PROTOCOL_ERROR = "This field is required for the Venture protocol.";
const MSG_SYSTEM_ERROR = "Venture Interrupted: ";

$w.onReady(function () {
    $w("#submitStep1").onClick(async () => {
        $w("#multiStepForm").changeState("MarketContext");
    });

    $w("#payAndSubmitBtn").onClick(async () => {
        const payload = gatherFormData();
        
        try {
            const payment = await createPayment(149);
            const result = await wixPay.startPayment(payment.id);
            
            if (result.status === "Successful") {
                $w("#payAndSubmitBtn").disable();
                $w("#statusText").text = "Payment verified. Generating your reports...";
                
                await handlePaymentResult(result.paymentId, payload);
                wixLocation.to("/success");
            }
        } catch (err) {
            $w("#statusText").text = `Error: ${err.message}`;
            $w("#statusText").show();
        }
    });
});

function setupValidation() {
    const fields = ["#name", "#pitch"];
    
    fields.forEach(fieldId => {
        const el = $w(fieldId);
        
        if (el && typeof el.onCustomValidation === 'function') {
            el.onCustomValidation((value, reject) => {
                if (!value || value.trim().length === 0) {
                    reject(MSG_PROTOCOL_ERROR);
                }
            });
        } else {
            console.warn(`${VERSION_TAG} Selector ${fieldId} is missing or does not support custom validation.`);
        }
    });
}

function showVisualError(message) {
    const errorBar = $w("#errorText");
    if (!errorBar) return;
    
    errorBar.text = message;
    errorBar.show("fade", { duration: 200 });
    
    setTimeout(() => {
        errorBar.hide("fade");
    }, 5000);
}

async function processVentureSubmission() {
    toggleLoading(true);
    $w("#errorText").hide();

    const formData = {
        name: $w("#name").value,
        pitch: $w("#pitch").value,
        revenueModel: $w("#revenueModel").value,
        moat: $w("#moat").value,
        inventory: $w("#inventory").value,
        targetCatgory: $w("#targetCatgory").value,
        currentAlternatives: $w("#currentAlternatives").value,  
        pricePoint: $w("#pricePoint").value,
        frictionPoints: $w("#frictionPoints").value,
        killCriteria: $w("#killCriteria").value,
        biggestFear: $w("#biggestFear").value,
        bottleneck: $w("#bottleneck").value
    };

    try {
        const payload = formatVenturePayload(formData);
        const result = await sendPayloadToWorkflow(payload);

        if (result.success) {
            wixLocation.to("/checkout");
        } else {
            toggleLoading(false);
            showVisualError(`${MSG_SYSTEM_ERROR} ${result.error}`);
        }
    } catch (err) {
        console.error("${VERSION_TAG} Submission failed:", err);
        toggleLoading(false);
        showVisualError("A system error occurred. Please try again.");
    }
}

function isFormValid() {
    return $w("#name").valid && 
           $w("#pitch").valid;
}

function toggleLoading(isLoading) {
    const btn = $w("#submitButton");
    if (isLoading) {
        btn.disable();
        btn.label = "Syncing Butterflies...";
    } else {
        btn.enable();
        btn.label = "Initiate Flight Path";
    }
}