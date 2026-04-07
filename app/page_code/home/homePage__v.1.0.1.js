import { formatVenturePayload } from 'public/utils/formatters';
import { sendPayloadToWorkflow } from 'backend/services/n8nManager.web';
import wixLocation from 'wix-location';

$w.onReady(function () {
    // Hide error messages on load
    $w("#errorText").hide();
    setupValidation();
    
    $w("#submitButton").onClick(async () => {
        if (isFormValid()) {
            await processVentureSubmission();
        } else {
            // This is the missing function
            showVisualError("Please complete all required fields before takeoff.");
        }
    });
});

/**
 * Handles the visual feedback for validation errors
 * @param {string} message - The error message to display
 */
function showVisualError(message) {
    const errorBar = $w("#errorText");
    errorBar.text = message;
    errorBar.show("fade", { duration: 200 });
    
    // Auto-hide after 5 seconds for a cleaner UX
    setTimeout(() => {
        errorBar.hide("fade");
    }, 5000);
}

async function processVentureSubmission() {
    toggleLoading(true);
    $w("#errorText").hide();

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

    const payload = formatVenturePayload(formData);
    const result = await sendPayloadToWorkflow(payload);

    if (result.success) {
        wixLocation.to("/checkout");
    } else {
        toggleLoading(false);
        showVisualError("Flight Interrupted: " + result.error);
    }
}

function setupValidation() {
    // List of IDs to validate
    const fields = ["#inputName", "#inputZip", "#textBoxPitch"];
    
    fields.forEach(fieldId => {
        $w(fieldId).onCustomValidation((value, reject) => {
            if (!value || value.trim().length === 0) {
                reject("This field is required for the FlutterSync protocol.");
            }
        });
    });
}

function isFormValid() {
    // Check if the specific inputs are valid based on our custom rules
    return $w("#name").valid && 
           // $w("#inputZip").valid && 
           $w("#pitch").valid;
}

function toggleLoading(isLoading) {
    if (isLoading) {
        $w("#submitButton").disable();
        $w("#submitButton").label = "Syncing Butterflies...";
    } else {
        $w("#submitButton").enable();
        $w("#submitButton").label = "Initiate Flight Path";
    }
}