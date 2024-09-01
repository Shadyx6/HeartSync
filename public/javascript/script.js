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


document.querySelector('.message-input').addEventListener('keydown', function (event) {
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
    socket.on('signalingMessage', handleSignalingMessage)
    try {
        local = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        })
        document.querySelector('#local-vid').srcObject = local
        initiateOffer()
    } catch (error) {
        console.log(error )
    }
   
}

const initiateOffer = async () => {
    await createPeerConnection();
try {
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    console.log(peerConnection, offer)
    socket.emit('signalingMessage',{room, message: JSON.stringify({ type: 'offer', offer,room })})
} catch (error) {
    console.log(error)
}

}

const createPeerConnection = async () => {
    peerConnection = new RTCPeerConnection(rtcSettings)
    remote = new MediaStream()
    document.querySelector('#remote-vid').srcObject = remote
    console.log(document.querySelector('#remote-vid').srcObject)
    document.querySelector('.vid-container').classList.toggle('hidden')
    document.querySelector('#chat').classList.add('hidden')

    local.getTracks().forEach((track) => {
        peerConnection.addTrack(track, local)
        console.log(peerConnection, track)
    })
    try {
        peerConnection.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => remote.addTrack(track))
            console.log(event)
        }
    } catch (error) {
        console.log(error)
    }
 
    peerConnection.onicecandidate = (event) => {
        if(event.candidate){
            socket.emit('signalingMessage', {room, message: JSON.stringify({type: 'candidate', candidate: event.candidate })})
        }
            

    }
    peerConnection.onconnectionstatechange = () => {
        console.log('connection state:', peerConnection.connectionState)
    }

}

const handleSignalingMessage = async (message) => {
    const { type, offer, answer, candidate } = JSON.parse(message)
    if (type === 'offer') handleOffer(offer);
    if (type === 'answer') handleAnswer(answer)
    if (type === 'candidate' && peerConnection) {
        try {
           await peerConnection.addIceCandidate(candidate)
            console.log(candidate)
        } catch (error) {
            console.log(error)
        }
    }

}

const handleOffer = async (offer) => {
    try {
        await createPeerConnection()
        await peerConnection.setRemoteDescription(offer)
    
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        console.log(answer)
        socket.emit('signalingMessage',{ room, message : JSON.stringify({type: 'answer', answer })})
    } catch (error) {
        
    }
   
}

const handleAnswer = async (answer) => {
    try {
      await peerConnection.setRemoteDescription(answer)   
        console.log(answer)
    } catch (error) {
        console.log(error)
    }
  
}


document.querySelector('.videoCall').addEventListener('click', () => {
    socket.emit('offerVideoCall', room)
    document.querySelector('.ringing').classList.remove('hidden')

})

socket.on('incomingVideoCall', () => {
    document.querySelector('.incomingOverlay').classList.toggle('hidden')

    })
    document.querySelector('.decline').addEventListener('click', () => {
        document.querySelector('.incomingOverlay').classList.toggle('hidden')
        socket.emit('callDeclined', room)
    })

document.querySelector('.accept').addEventListener('click', () => {
    document.querySelector('.incomingOverlay').classList.add('hidden')
    initialize()
    document.querySelector('.vid-container').classList.remove('hidden')
    document.querySelector('.chat-box').style.display = 'none'
 
    socket.emit('acceptedCall', room)
})

socket.on('callAccepted', () => {
    initialize()
    document.querySelector('.chat-box').style.display = 'none'
    document.querySelector('.vid-container').classList.remove('hidden')
    document.querySelector('.ringing').classList.add('hidden')
})

{/* <div class="flex flex-col justify-between h-full w-full bg-tranparent hidden ">
<div class="top p-4 bg-black bg-opacity-50 w-full h-fit mr-auto">
<p>Stranger Connected</p>
</div>
<div class="bot flex justify-center mb-10 items-center">
<button class=" bg-red-500 ease-linear duration-200 px-7 py-3 hover:bg-red-700 rounded-lg ">Hang up</button>
</div>
</div> */}
