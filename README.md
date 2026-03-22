# SVU ConnectHub

A professional-grade web application for Syrian Virtual University students to organize their study materials and generate AI-powered mock tests.

## Architecture

*   **Frontend**: React (Vite), functional components, custom hooks, and standard services.
*   **Backend**: Node.js/Express, Mongoose for MongoDB, modular folder structure.
*   **Database**: MongoDB
*   **AI Integration**: Expandable to use OpenAI/Gemini APIs for test generation.

## Project Structure

*   **/backend**: Houses the REST API, MongoDB models, controllers, and services.
*   **/frontend**: Houses the React SPA.

## Getting Started

### Backend
1. `cd backend`
2. Configure your `.env` file (Database URI, API keys, etc.).
3. `npm install` (if not done)
4. `npm run dev` or `node server.js` to start.

### Frontend
1. `cd frontend`
2. `npm install` (if not done)
3. `npm run dev` to start Vite development server.