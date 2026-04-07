import { getSecret } from 'wix-secrets-backend';
import { fetch } from 'wix-fetch';

/**
 * Dispatches the FlutterSync payload to the n8n workflow
 * @param {Object} payload 
 */
export async function sendPayloadToWorkflow(payload) {
    const webhookUrl = await getSecret("N8N_VENTURE_WEBHOOK");

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("n8n dispatch failed");
        
        return { success: true, data: await response.json() };
    } catch (err) {
        console.error("Workflow Error:", err);
        return { success: false, error: err.message };
    }
}