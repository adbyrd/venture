/**
 * n8n Manager - VENTURE
 * Dispatches the payload to the n8n workflow
 * Path: /backend/services/n8nManager.web.js
 * Version: [n8n Manager: v1.2.0]
 */

import { getSecret } from 'wix-secrets-backend';
import { fetch } from 'wix-fetch';
import { Permissions, webMethod } from 'wix-web-module'; 

const VERSION_TAG = '[n8n Manager: v1.2.0]';

export const sendPayloadToWorkflow = webMethod(Permissions.Anyone, async (payload) => {
    const webhookUrl = await getSecret("VENTURE_TEST"); 

    try {
        console.log(`${VERSION_TAG} Initiating dispatch to n8n...`);
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`${VERSION_TAG} Dispatch failed with status: ${response.status}`);
            return { success: false, error: "n8n dispatch failed" };
        }
        
        const data = await response.json();
        return { success: true, data };

    } catch (err) {
        console.error(`${VERSION_TAG} Workflow Error:`, err);
        return { success: false, error: "Network or System Error" };
    }
});

export async function firePayloadToN8n(payloadData) {
    const webhookUrl = await getSecret("N8N_WEBHOOK_URL");

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...payloadData,
            timestamp: new Date().toISOString(),
            environment: "production_2026"
        })
    });

    if (response.ok) {
        return { success: true };
    } else {
        throw new Error("Automation pipeline failed to initialize.");
    }
}