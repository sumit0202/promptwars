# Universal Intent-to-Action Bridge 🌉

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Security](https://img.shields.io/badge/security-A%2B-green.svg)

## 📌 Chosen Vertical
**Smart Emergency & Civic Dispatch Assistant (Public Security & Operations)**

## 🚀 Approach and Logic
The objective of this application is to map unstructured natural language inputs from users (e.g., "My neighbor's house is on fire!" or "There is a noisy party next door") directly into structured, actionable JSON payloads utilized by automated dispatch engines. 

The architecture strictly follows an **MVC (Model-View-Controller)** pattern bridging frontend GIS interfaces with a secure Node.js backend. The logic leverages the **Google Gemini Generative AI** model to semantically parse the input, identifying the `intent`, calculating the `risk_level`, and inferring the exact `authorities` required. 

This is followed by rigorous **Google Services Pipelines**:
1. Google Maps & Places API instantly cross-references the user's HTML5 Geolocation to deploy spatial markers highlighting the nearest required authorities (Hospitals, Police, Fire Stations).
2. Google Cloud Translation API handles Native localization.
3. Google Cloud BigQuery streams pipeline telemetry.
4. Google Cloud Pub/Sub handles asynchronous messaging queues.
5. Google Cloud Firestore natively caches events for immutable audit logging.

## ⚙️ How the Solution Works
1. **Ingestion**: The frontend issues a secured POST request capped at 1MB to `/api/process`.
2. **Sanitization**: Deep Express Middleware validates inputs, limits parsing rates via `express-rate-limit`, blocks Parameter Pollution via `hpp`, prevents XSS, and securely validates Cross-Site cookies via `csurf`.
3. **Inference**: A secure proxy validates the Google SDK `GEMINI_API_KEY`, feeding the raw sequence into the Generative AI matrix, forcing a STRICT JSON array return.
4. **Data-Lake Steaming**: Telemetry is backed to Cloud Storage and BigQuery asynchronously.
5. **GIS Deployment**: The frontend dynamically requests the Maps JS payload and paints nearby responses natively onto an interactive Map container.

## 🧠 Assumptions Made
- It is assumed that the client browser natively supports HTML5 Geolocation APIs for the Maps GIS integration.
- It is assumed the Application will be deployed to **Google Cloud Run** running natively via the appended multi-stage Dockerfile environment mapping port `3000`.
- It is assumed that missing GCP Application Credentials fall back gracefully without crashing to allow local evaluations.

## 🛠️ Tech Stack & Advanced Security
- **Core**: Node.js, Express, Vanilla JS / HTML5 (No frontend framework dependencies inflating execution times).
- **Security Protocols**: Helmet (Strict CSP/HSTS), CSRF Token Mitigation, Cookie-Parser, Explicit body Limits, OWASP standards, and non-root Docker encapsulation.
- **Documentation**: Natively implemented Swagger OpenAPI definitions on `/api-docs`.
