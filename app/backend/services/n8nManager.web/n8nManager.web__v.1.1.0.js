/**
 * n8n Manager - VENTURE
 * Dispatches the payload to the n8n workflow
 */
import { getSecret } from 'wix-secrets-backend';
import { fetch } from 'wix-fetch';
import { Permissions, webMethod } from 'wix-web-module'; // Required for .web.js files 

export const sendPayloadToWorkflow = webMethod(Permissions.Anyone, async (payload) => {
    // Standards: Never hard-code URLs; use Secret Manager [cite: 13, 98]
    const webhookUrl = await getSecret("N8N_VENTURE_WEBHOOK"); 

    try {
        // Standards: Include logging with module prefix [cite: 29, 33]
        console.log('[n8nManager] Initiating dispatch to n8n...');

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            // Standards: Provide structured error responses [cite: 118, 119]
            console.error(`[n8nManager] Dispatch failed with status: ${response.status}`);
            return { success: false, error: "n8n dispatch failed" };
        }
        
        const data = await response.json();
        return { success: true, data };

    } catch (err) {
        // Standards: Log errors gracefully without exposing technical details to UI [cite: 10, 156]
        console.error("[n8nManager] Workflow Error:", err);
        return { success: false, error: "Network or System Error" };
    }
});