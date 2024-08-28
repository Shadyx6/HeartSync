const socket = io()

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


