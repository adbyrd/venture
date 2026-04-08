/**
 * n8n Manager - VENTURE
 * Dispatches the payload to the n8n workflow
 * Path: /backend/services/n8nManager.web.js
 * Version: [n8n Manager: v1.4.1]
 */

import { getSecret } from 'wix-secrets-backend';
import { fetch } from 'wix-fetch';
import { Permissions, webMethod } from 'wix-web-module'; 

const VERSION_TAG = '[n8n Manager: v1.4.1]';

export const firePayloadToN8n = webMethod(Permissions.Anyone, async (payloadData) => {
    console.log(`${VERSION_TAG} [START] firePayloadToN8n`);
    try {
        const url = await getSecret("VENTURE_INTAKE__WEBHOOK_TEST");
        console.log(`${VERSION_TAG} [DATA] Endpoint: ${url.substring(0, 20)}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...payloadData,
                meta: { version: VERSION_TAG, env: "Manual_Test_Mode" }
            })
        });

        console.log(`${VERSION_TAG} [RESULT] n8n Status: ${response.status}`);
        if (!response.ok) throw new Error(`n8n_HTTP_${response.status}`);
        
        return { success: true };
    } catch (error) {
        console.error(`${VERSION_TAG} [ERROR] firePayloadToN8n:`, error.message);
        throw error;
    }
});