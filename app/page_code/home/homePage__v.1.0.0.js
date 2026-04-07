import { formatVenturePayload } from 'public/utils/formatters';
import { sendPayloadToWorkflow } from 'backend/services/n8nManager.web';
import wixLocation from 'wix-location';

$w.onReady(function () {
    setupValidation();
    
    // Handle Submit
    $w("#submitButton").onClick(async () => {
        if (isFormValid()) {
            await processVentureSubmission();
        } else {
            showVisualError("Please complete all required fields.");
        }
    });
});

async function processVentureSubmission() {
    toggleLoading(true);

    // 1. Gather data from UI elements
    const formData = {
		// COMPANY
		// zipCode: $w("#zipCode").value,
		// competitors: $w("#inputAlternatives").value,

		// CORE
        name: $w("#name").value,
		pitch: $w("#pitch").value,
		revenueModel: $w("#revenueModel").value,
        moat: $w("#moat").value,
        inventory: $w("#inventory").value,

		// MARKET
        targetCatgory: $w("#targetCatgory").value,
        currentAlternatives: $w("#currentAlternatives").value,  
        pricePoint: $w("#pricePoint").value,
        frictionPoints: $w("#frictionPoints").value,

		// REALITY
        killCriteria: $w("#killCriteria").value,
        biggestFear: $w("#biggestFear").value,
        bottleneck: $w("#bottleneck").value
    };

    // 2. Format for the FlutterSync Schema
    const payload = formatVenturePayload(formData);

    // 3. Dispatch to n8n via Backend Web Module
    const result = await sendPayloadToWorkflow(payload);

    if (result.success) {
        // Redirect to Checkout with the Payload ID or temporary session
        wixLocation.to("/checkout");
    } else {
        toggleLoading(false);
        $w("#errorText").text = "Submission failed. Please try again.";
        $w("#errorText").show();
    }
}

function setupValidation() {
    // Enterprise-grade: Real-time validation for high-end UX
    const requiredInputs = $w("TextInput, TextBox");
    requiredInputs.onCustomValidation((value, reject) => {
        if (!value || value.length < 3) reject("Field too short");
    });
}

function toggleLoading(isLoading) {
    if (isLoading) {
        $w("#submitButton").disable();
        $w("#submitButton").label = "Processing Luxury Assets...";
        //$w("#loadingOverlay").show();
    } else {
        $w("#submitButton").enable();
        $w("#submitButton").label = "Initiate Flight Path";
        //$w("#loadingOverlay").hide();
    }
}

function isFormValid() {
    // Checks all input components on the page
    return $w("#name").valid && $w("#pitch").valid && $w("#pitch").valid;
}