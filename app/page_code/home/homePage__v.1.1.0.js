/**
 * HOME - VENTURE
 */

import { formatVenturePayload } from 'public/utils/formatters';
import { sendPayloadToWorkflow } from 'backend/services/n8nManager.web';
import wixLocation from 'wix-location';

// 1. Standards Compliance: Define user-facing messages as constants 
const MSG_VALIDATION_ERROR = "Please complete all required fields before takeoff.";
const MSG_PROTOCOL_ERROR = "This field is required for the FlutterSync protocol.";
const MSG_SYSTEM_ERROR = "Flight Interrupted: ";

$w.onReady(function () {
    $w("#errorText").hide();
    setupValidation();
    
    $w("#submitButton").onClick(async () => {
        if (isFormValid()) {
            await processVentureSubmission();
        } else {
            showVisualError(MSG_VALIDATION_ERROR);
        }
    });
});

/**
 * 2. Standards Compliance: Defensive Validation 
 * Ensures onCustomValidation is only called on valid input elements.
 */
function setupValidation() {
    // Corrected IDs to match standard naming conventions if necessary 
    const fields = ["#name", "#pitch"];
    
    fields.forEach(fieldId => {
        const el = $w(fieldId);
        
        // Check existence and verify it's an input element before calling validation
        if (el && typeof el.onCustomValidation === 'function') {
            el.onCustomValidation((value, reject) => {
                if (!value || value.trim().length === 0) {
                    reject(MSG_PROTOCOL_ERROR);
                }
            });
        } else {
            // Standards Compliance: Log key errors for traceability [cite: 35]
            console.warn(`[homePage] Selector ${fieldId} is missing or does not support custom validation.`);
        }
    });
}

/**
 * 3. Standards Compliance: Centralized Error Handling [cite: 156]
 */
function showVisualError(message) {
    const errorBar = $w("#errorText");
    if (!errorBar) return; // Safe UI check [cite: 50]
    
    errorBar.text = message;
    errorBar.show("fade", { duration: 200 });
    
    setTimeout(() => {
        errorBar.hide("fade");
    }, 5000);
}

async function processVentureSubmission() {
    toggleLoading(true);
    $w("#errorText").hide();

    // Mapping UI to local state [cite: 48]
    const formData = {
        name: $w("#name").value, // Updated to match validation ID
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
        // Standards Compliance: Never expose raw technical errors [cite: 160]
        console.error("[homePage] Submission failed:", err);
        toggleLoading(false);
        showVisualError("A system error occurred. Please try again.");
    }
}

function isFormValid() {
    // Verify validity of inputs used in setupValidation [cite: 58]
    return $w("#name").valid && 
           //$w("#inputZip").valid && 
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