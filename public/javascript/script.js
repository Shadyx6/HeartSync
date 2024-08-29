const socket = io()
let room;
socket.emit('joinRoom')

socket.on('joinedRoom', () => {
    document.querySelector('.empty').classList.add('hidden')
    console.log('joined')
})
// Function to send a message
function sendMessage() {
    const messageInput = document.querySelector('.message-input'); // Select the input field
    const message = messageInput.value.trim(); // Get the trimmed value

    if (message !== "") {
        // Append the message to the chat window
        appendMessage('You', message);

        // Emit the message to the server to broadcast it to others
        socket.emit('chatMessage', message);

        // Clear the input field after sending
        messageInput.value = '';
    }
}

// Function to receive messages using Socket.io
function receiveMessage() {
    socket.on('chatMessage', (message, sender) => {
        // Append the received message to the chat window
        appendMessage(sender, message);
    });
}

// Utility function to append messages to the chat window
function appendMessage(sender, message) {
    const chatWindow = document.getElementById('chat-window');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    // Optionally add a class if it's the sender's message
    if (sender === 'You') {
        messageElement.classList.add('your-message');
    }

    // Set the inner HTML of the message
    messageElement.innerHTML = `  <div class="flex items-start w-fit min-w-56 max-w-[30rem] space-x-3 mb-4 py-2">
        <div class="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
          <span class="text-white font-bold text-sm"></span>
        </div>
        <div class="flex-1 p-3 break-words">
          <div class="text-m text-white"></div>
          <div class="text-xs text-gray-600 mt-1"></div>
        </div>
      </div>`;

    // Append the message to the chat window
    chatWindow.appendChild(messageElement);

    // Scroll to the bottom of the chat window
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Remove the "No one is here yet" message if a message is sent or received
    const emptyMessage = document.querySelector('.empty');
    if (emptyMessage) {
        emptyMessage.style.display = 'none';
    }
}

// Initialize the receiveMessage function to start listening for messages
receiveMessage();

// Event listener for the send button
document.querySelector('.bg-blue-500').addEventListener('click', sendMessage);

// Optionally, you can also send the message when pressing the 'Enter' key
document.querySelector('.message-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

let local;
let remote;
let peerConnection;

let rtcSettings = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
    ]
}

const initialize = async () => {
    local = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
    document.querySelector('#local-vid').srcObject = local
    initiateOffer()
}

const initiateOffer = async () => {
    await createPeerConnection();

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    socket.emit('signalingMessage', JSON.stringify({ type: 'offer', offer }))
}

const createPeerConnection = async () => {
    peerConnection = new RTCPeerConnection(rtcSettings)
    remote = new MediaStream()
    document.querySelector('#remote-vid').srcObject = remote
    document.querySelector('.vid-container').classList.toggle('hidden')
    document.querySelector('#chat').classList.add('hidden')

    local.getTracks().forEach((track) => {
        peerConnection.addTrack(track, local)
    })

    peerConnection.ontrack = (event) => {
        console.log(event)
        event.streams[0].getTracks().forEach((track) => remote.addTrack(track))
    }
    peerConnection.onicecandidate = (event) => {
        event.candidate &&
            socket.emit('signalingMessage', JSON.stringify({ type: 'candidate', candidate: event.candidate }))

    }

}

const handleSignalingMessage = async (message) => {
    const { type, offer, answer, candidate } = JSON.parse(message)
    if (type === 'offer') handleOffer(offer);
    if (type === 'answer') handleAnswer(answer)
    if (type === 'candidate' && peerConnection) {
        peerConnection.addIceCandidate(candidate)
    }

}

const handleOffer = async (offer) => {
    await createPeerConnection()
    await peerConnection.setRemoteDescription(offer)

    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)
    console.log('sending offer')
    socket.emit('signalingMessage', JSON.stringify({ type: 'answer', answer }))
}

const handleAnswer = (answer) => {
    if(!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer)
    }
    console.log('answering')
}


