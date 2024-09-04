const socket = io()
let room;
socket.emit('joinRoom')

socket.on('joinedRoom', (newRoom) => {
    document.querySelector('.empty').classList.add('hidden')
    document.querySelector('.non-empty').classList.add('animate-popUp')
    setTimeout(() => {
        document.querySelector('.non-empty').classList.add('hidden')
    }, 3000);
    room = newRoom;
})

function sendMessage() {
    const messageInput = document.querySelector('.message-input');
    const message = messageInput.value.trim();

    if (message !== "") {
        appendMessage('You', message);
        socket.emit('chatMessage', { message, room });
        messageInput.value = '';
    }
}


function receiveMessage() {
    socket.on('messageReceived', (data) => {
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
let inCall = false
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
        inCall = true
    } catch (error) {
        console.log(error )
    }
   
}

const initiateOffer = async () => {
    await createPeerConnection();
try {
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    socket.emit('signalingMessage',{room, message: JSON.stringify({ type: 'offer', offer,room })})
} catch (error) {
    console.log(error)
}

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
    try {
        peerConnection.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => remote.addTrack(track))
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
    if(type === 'hangup'){
        hangup()
    }; 
    if (type === 'answer') handleAnswer(answer)
    if (type === 'candidate' && peerConnection) {
        try {
           await peerConnection.addIceCandidate(candidate)

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
        socket.emit('signalingMessage',{ room, message : JSON.stringify({type: 'answer', answer })})
    } catch (error) {
        console.log(error)
    }
   
}

const handleAnswer = async (answer) => {
    try {
      await peerConnection.setRemoteDescription(answer)   

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
    document.querySelector('.vid-container').style.display = 'block'
    document.querySelector('.chat-box').style.display = 'none'
 
    socket.emit('acceptedCall', room)
})

socket.on('callAccepted', () => {
    initialize()
    document.querySelector('.chat-box').style.display = 'none'
    document.querySelector('.vid-container').classList.remove('hidden')
    document.querySelector('.vid-container').style.display = 'block'
    document.querySelector('.ringing').classList.add('hidden')
})



const localVideoContainer = document.getElementById('local-video-container');
const videoContainer = document.querySelector('.vid-container');


let isDragging = false;
let startX, startY, initialX, initialY;


const startDrag = (x, y) => {
    isDragging = true;
    startX = x;
    startY = y;
    initialX = localVideoContainer.offsetLeft;
    initialY = localVideoContainer.offsetTop;
    localVideoContainer.style.cursor = 'grabbing';
};


const performDrag = (x, y) => {
    if (isDragging) {
        let newX = initialX + (x - startX);
        let newY = initialY + (y - startY);

      
        newX = Math.max(0, Math.min(newX, videoContainer.clientWidth - localVideoContainer.clientWidth));
        newY = Math.max(0, Math.min(newY, videoContainer.clientHeight - localVideoContainer.clientHeight));

       
        localVideoContainer.style.left = newX + 'px';
        localVideoContainer.style.top = newY + 'px';
    }
};


const stopDrag = () => {
    isDragging = false;
};


localVideoContainer.addEventListener('mousedown', (e) => {
    e.preventDefault();

    startDrag(e.clientX, e.clientY);
});

document.addEventListener('mousemove', (e) => {
    performDrag(e.clientX, e.clientY);
});

document.addEventListener('mouseup', stopDrag);


localVideoContainer.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
   
    startDrag(touch.clientX, touch.clientY);
});

document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    performDrag(touch.clientX, touch.clientY);
});

document.addEventListener('touchend', stopDrag);


let hangupBtn = document.querySelector('.hangup')
hangupBtn.addEventListener('click', (e) => {
    hangup()
})
function hangup() {
    if (peerConnection) {
        peerConnection.close()
        peerConnection = null;
        local.getTracks().forEach(track => track.stop())
        document.querySelector('.vid-container').classList.add('hidden')
        document.querySelector('.vid-container').style.display = 'none'
        document.querySelector('.chat-box').style.display = 'block'
        inCall = false
        socket.emit('signalingMessage', {room, message: JSON.stringify({type: 'hangup'})})
    }
}