---
description: Ensure all testing instructions refer to the Railway deployment instead of local environment.
---

# Railway Testing Environment

## Description
This skill ensures that whenever testing application features, APIs, or database connections, the user is always instructed to test on the Railway production deployment instead of locally. The local environment is missing critical `.env` variables (such as database credentials and cloud storage keys).

## Instructions
1. **Never ask the user to test locally**: Do not instruct the user to run `npm run dev`, `npm start`, or open `localhost` to verify functionality. The local environment lacks the required environment variables.
2. **Always test on Railway**: When verifying if a change works, instruct the user to rely on their Railway deployment. Tell them to push their code to the repository or wait for the Railway CI/CD pipeline to deploy the application, and then test the behavior on the live Railway URL.
3. **Database and Cloud Storage Dependencies**: Keep in mind that any feature requiring external services (Database, Cloud Storage, Gemini API, Authentication) will ONLY function correctly in the Railway environment where the corresponding `.env` variables are configured. Use this context when troubleshooting errors.
