HeartSync - Real-Time Video Calling App
HeartSync is a real-time video calling application built using backend technologies including Node.js, Express, and WebRTC. This app allows users to connect over high-quality video calls, delivering a seamless and reliable communication experience.

Features
High-Quality Video Calls: Real-time video calls using WebRTC.
Secure and Private: End-to-end encryption ensures secure communication.
Simple UI: User-friendly interface that makes joining or hosting calls quick and easy.
Scalable Backend: Efficiently handles multiple users with a robust backend using Node.js and Express.
Technologies Used
Node.js: Manages the backend server.
Express: Framework for routing and middleware.
WebRTC: Enables real-time video and audio communication.
Socket.io (optional): Supports real-time data exchange for signaling between peers.

Overview: 
![1731068279210](https://github.com/user-attachments/assets/a1e47d38-8a8b-497d-9531-3983aa39537a)
![1731068278950](https://github.com/user-attachments/assets/b489da25-20ce-4d68-9934-11583931fb23)
![1731068279190](https://github.com/user-attachments/assets/a847aba0-480a-4aa9-b8ee-cfcea1b3beb9)

![1731068278986](https://github.com/user-attachments/assets/512c5fe4-dff7-439b-870f-fbce49dead91)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/heartsync.git
   cd heartsync

Install dependencies:

```bash

npm install
```

Set up environment variables: Create a .env file in the root directory and configure your server settings

```env

PORT=3000
```
Start the server:

```bash

npx nodemon app.js
```
Access the app: Visit http://localhost:3000 in your browser.

**Usage**
Start a Call: Share the unique room link with others to start a video call.
Join a Call: Enter the shared room link in your browser to join an existing call.

**Folder Structure**
server.js: Main server file initializing the application.
public/: Contains static assets and client-side scripts.
routes/: Defines routes for initializing and managing video call sessions.
controllers/: Manages WebRTC connections and signaling.

Future Enhancements
Screen Sharing: Enable participants to share their screens during calls.
Text Chat: Integrated text chat feature for a complete communication experience.
Recording: Option to record calls for later review.

License
This project is licensed under the MIT License.

