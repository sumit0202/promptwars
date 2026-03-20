# Security Policy

## Supported Versions
Only the latest major branch is formally supported.

| Version | Supported          |
| ------- | ------------------ |
| v1      | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please responsibly disclose it immediately via email. 

This repository leverages the following DevSecOps Pipeline:
- **NPM Auditing**: Run automatically on PRs.
- **HSTS / CSP**: Configured universally.
- **Data Sanitization**: Protected against Buffer Overflows (< 1MB allocations), XSS attacks (express-validator escape mapping), MongoDB NoSQL string operations injection `$`, and HTTP Parameter Pollution (`hpp`).
