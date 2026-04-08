/**
 * n8n Manager - VENTURE
 * Dispatches the payload to the n8n workflow
 * Path: /backend/services/n8nManager.web.js
 * Version: [n8n Manager: v1.4.0]
 */

import { getSecret } from 'wix-secrets-backend';
import { fetch } from 'wix-fetch';
import { Permissions, webMethod } from 'wix-web-module'; 

const VERSION_TAG = '[n8n Manager: v1.4.0]';

/**
 * Fires the validated payload to n8n only after the payment flag is true.
 */
export const firePayloadToN8n = webMethod(Permissions.Anyone, async (payloadData) => {
    const webhookUrl = await getSecret("N8N_WEBHOOK_URL");

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...payloadData,
            source: "VentureAnalyst_AI_Engine",
            timestamp: new Date().toISOString()
        })
    });

    if (!response.ok) {
        throw new Error("Automation pipeline failed to trigger.");
    }

    return { success: true };
});