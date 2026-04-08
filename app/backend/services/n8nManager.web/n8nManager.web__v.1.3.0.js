/**
 * n8n Manager - VENTURE
 * Dispatches the payload to the n8n workflow
 * Path: /backend/services/n8nManager.web.js
 * Version: [n8n Manager: v1.3.0]
 */

import { getSecret } from 'wix-secrets-backend';
import { fetch } from 'wix-fetch';
import { Permissions, webMethod } from 'wix-web-module'; 

const VERSION_TAG = '[n8n Manager: v1.3.0]';

export const firePayloadToN8n = webMethod(Permissions.Everyone, async (payloadData) => {
    const webhookUrl = await getSecret("N8N_WEBHOOK_URL");

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...payloadData,
            submissionDate: new Date().toISOString(),
            platform: "VentureAnalyst_AI_2026"
        })
    });

    if (!response.ok) {
        throw new Error("Failed to trigger the analysis engine.");
    }

    return { success: true, message: "Analysis pipeline initiated." };
});