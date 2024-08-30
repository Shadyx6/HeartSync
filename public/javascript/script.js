const socket = io()
let room;
socket.emit('joinRoom')

socket.on('joinedRoom', (newRoom) => {
    document.querySelector('.empty').classList.add('hidden')
    room = newRoom;
    console.log(room)
})

function sendMessage() {
    const messageInput = document.querySelector('.message-input'); 
    const message = messageInput.value.trim(); 

    if (message !== "") {
        appendMessage('You', message); 
        console.log(room);
        socket.emit('chatMessage', { message, room });
        messageInput.value = '';
    }
}


function receiveMessage() {
    socket.on('messageReceived', (data) => {
    
        console.log(data)
        appendMessage('Stranger', data.message);
    });
}


function appendMessage(sender, message) {
    const chatWindow = document.getElementById('chat-window');
    let date = Date.now()
    let time = new Date(date);
    let formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    var container = ""
    // Set the inner HTML of the message
    container = `<div class="mt-5 w-fit min-w-[150px] ${sender === 'You' ? 'ml-auto bg-[#14b8a6] rounded-l-lg rounded-br-lg' : 'bg-[#34d399] rounded-r-lg rounded-bl-lg'}
     max-w-[28rem] break-words p-2 ">
              <h1 class="message-username">${sender}</h1>
              <p class="message-content">${message}</p>
              <p class="message-timestamp">${formattedTime}</p>
            </div>
          </div>`;

    
    chatWindow.innerHTML += container
    console.log(container)
    chatWindow.scrollTop = chatWindow.scrollHeight;

    const emptyMessage = document.querySelector('.empty');
    if (emptyMessage) {
        emptyMessage.style.display = 'none';
    }
}


receiveMessage();


document.querySelector('.bg-blue-500').addEventListener('click', sendMessage);


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
        console.log(event)
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

document.querySelector('.videoCall').addEventListener('click', () => {
    socket.emit('offerVideoCall', room)
})

socket.on('incomingVideoCall', () => {
    alert('working')
})