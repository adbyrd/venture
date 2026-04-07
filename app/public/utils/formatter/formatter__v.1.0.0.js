/**
 * Formats the raw UI input into the FlutterSync JSON schema
 */

export function formatVenturePayload(formData) {
    return {
        company: {
            companyName: formData.name,
            companyNiche: "Remote-Controlled Wedding Butterflies",
            companyDetails: formData.details,
            companyZipCode: formData.zipCode
        },
        core: {
            companyPitch: formData.pitch,
            companyRevenue: formData.revenueModel,
            companyAdvantage: formData.moat,
            companyInventory: formData.inventory
        },
        market: {
            companyCategory: "B2C (via wedding planners)",
            companyAlternatives: formData.competitors,
            companyPrice: formData.pricePoint,
            companyFriction: formData.frictionPoints
        },
        variables: {
            killCriteria: formData.killCriteria,
            biggestFear: formData.biggestFear,
            bottleNeck: formData.bottleneck
        }
    };
}