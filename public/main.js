window.addEventListener('load', () => {

    var forms = document.getElementsByTagName('form')

    for (let f of forms) {
        f.addEventListener('submit', e => {
            e.preventDefault()
            grecaptcha.execute(recaps[f.id.replace('Form', '')])
            //sendData(f)
        })
    }

    var audioChunks = []
    var audioNode
    var audioInput
    var audioInit = false
    var audioLength = 0
    var context
    var sampleRate
    var recording = false
    var recordStart = document.getElementById('recordStart')
    var recordStop = document.getElementById('recordStop')
    var player = document.getElementById('player')

    recordStart.disabled = false

    let onMicStream = (stream) => {
        audioInput = context.createMediaStreamSource(stream)
        audioInput.connect(audioNode)
        audioNode.onaudioprocess = d => { 
            if (!recording) return
            audioChunks.push(new Float32Array(d.inputBuffer.getChannelData(0)))
            audioLength += 4096 
        }
        sampleRate = context.sampleRate
        audioInit = true
        recordStart.innerText = 'Start'
    }

    let initAudio = () => {
        let AudioContext = window.AudioContext || window.webkitAudioContext
        context = new AudioContext()
        if (context.createJavaScriptNode) audioNode = context.createJavaScriptNode(4096, 1, 1)
        else if (context.createScriptProcessor) audioNode = context.createScriptProcessor(4096, 1, 1)
        else alert('WebAudio not supported with your browser.')
        audioNode.connect(context.destination)
        navigator.mediaDevices.getUserMedia({audio:true}).then(onMicStream).catch(e => alert('An error occurred: ' + e))
    }

    let encodeWav = () => {
        let joinedBuf = new Float64Array(audioLength)
        let offset = 0
        let i
        for (i = 0; i < audioChunks.length; i++) {
            joinedBuf.set(audioChunks[i], offset)
            offset += audioChunks[i].length
        }
        
        let datlen = joinedBuf.length
        let buffer = new ArrayBuffer(44 + datlen * 2)
        let view = new DataView(buffer)
        writeString(view, 0, 'RIFF')
        view.setUint32(4, 44 + datlen * 2, true)
        writeString(view, 8, 'WAVE')
        writeString(view, 12, 'fmt ')
        view.setUint32(16, 16, true)
        view.setUint16(20, 1, true)
        view.setUint16(22, 1, true)
        view.setUint32(24, sampleRate, true)
        view.setUint32(28, sampleRate * 2, true)
        view.setUint16(32, 2, true)
        view.setUint16(34, 16, true)
        writeString(view, 36, 'data')
        view.setUint32(40, datlen * 2, true)

        offset = 44

        for (i = 0; i < datlen; i++) {
            view.setInt16(offset, joinedBuf[i] * 0x7FFF * 2, true)
            offset += 2
        }
        return view
    }

    let writeString = (view, offset, string) => { for (var i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i)) }

    recordStart.onclick = e => {
        audioChunks = []
        audioLength = 0
        if (!audioInit) {
            try {initAudio()} catch(e) {alert(e)}
        }
        else {
            recording = true
            recordStart.disabled = true
            recordStop.disabled = false
        }
    }

    recordStop.onclick = e => {
        recordStop.disabled = true
        recordStart.disabled = false
        recording = false
        console.log(audioChunks.length)
        console.log(sampleRate)
        let wavFile = encodeWav()
        blob = new Blob([wavFile], {type: 'audio/wav'})
        player.src = URL.createObjectURL(blob)
    }

})

var blob

var sendData = (form) => {
    var XHR = new XMLHttpRequest()
    let formName = form.id.replace('Form', '')

    XHR.addEventListener('load', (event) => console.log(event.target.responseText))

    XHR.addEventListener('error', (event) => console.log("Something went awry! " + event.target.responseText))

    XHR.open('POST', 'https://' + window.location.hostname + '/' + formName)

    let fd = new FormData(form)
    
    if (formName == 'voicemail') {
        if (!blob) return
        fd.append('audioblob', blob, 'test.wav')
    }

    XHR.send(fd)

    button = document.getElementById(formName + 'Button')
    button.innerText = 'Submitted'
    button.disabled = true
}

let recaps = {}

var onloadCallback = () => {
    recaps.contact = grecaptcha.render('contactRecap', {'callback': () => sendData(document.getElementById('contactForm'))}, true)
    recaps.voicemail = grecaptcha.render('voicemailRecap', {'callback': () => sendData(document.getElementById('voicemailForm'))}, true)
}