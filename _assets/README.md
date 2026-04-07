# Assets  

```bash
/root
├── .wix/                       # Wix system files (auto-generated)
├── src/                        # Main application source
│   ├── backend/                # Server-side logic (Velo)
│   │   ├── api/                # Exposed HTTP endpoints
│   │   │   └── webhooks.jsw    # Handles callbacks from n8n or payment providers
│   │   ├── services/           # Business logic & integrations
│   │   │   ├── n8nManager.jsw  # Logic for firing payloads to n8n
│   │   │   └── payment.jsw     # Custom pricing & checkout logic
│   │   ├── data/               # Data Hooks (beforeInsert, afterUpdate)
│   │   │   └── Payloads.js     # Data validation before storage
│   │   └── config/             # Environment constants
│   │       └── secrets.js      # Reference to Wix Secret Manager keys
│   ├── public/                 # Client-side shared code
│   │   ├── utils/              # Helper functions (formatting, validation)
│   │   └── constants/          # UI-related constants
│   └── pages/                  # Page-specific code
│       ├── Home.js             # The Form / Payload capture
│       ├── Checkout.js         # The E-commerce flow trigger
│       └── Success.js          # Post-payment confirmation UI
├── docs/                       # API documentation & PRD
├── .github/                    # CI/CD workflows
│   └── workflows/
│       └── deploy.yml          # Automated testing/deployment triggers
├── package.json                # NPM dependencies
└── wix.config.json             # Wix project configuration
```