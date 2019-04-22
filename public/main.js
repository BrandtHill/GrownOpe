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
    var audioRecorder
    var recording = false
    var recordStart = document.getElementById('recordStart')
    var recordStop = document.getElementById('recordStop')
    var player = document.getElementById('player')

    recordStart.disabled = false

    let onMicStream = (stream) => {
        audioInput = context.createMediaStreamSource(stream)
        audioInput.connect(audioNode)
        audioRecorder = new WebAudioRecorder(audioInput, {
            workerDir: 'lib/',
            encoding: 'mp3',
            options: {
                timeLimit: 900
            }
        })
        setRecorderCallbacks(audioRecorder)
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

    recordStart.onclick = e => {
        audioChunks = []
        audioLength = 0
        if (!audioInit) {
            try {initAudio()} catch(e) {alert(e)}
        }
        else {
            recording = true
            audioRecorder.startRecording()
            recordStart.disabled = true
            recordStop.disabled = false
        }
    }

    recordStop.onclick = e => {
        recordStop.disabled = true
        recordStart.disabled = false
        recording = false
        audioRecorder.finishRecording()
        //console.log(audioChunks.length)
        //console.log(sampleRate)
        //let wavFile = encodeWav()
        //blob = new Blob([wavFile], {type: 'audio/wav'})
        //player.src = URL.createObjectURL(blob)
    }

    let setRecorderCallbacks = (ar) => {
        ar.onComplete = (r, b) => {
            blob = b
            player.src = URL.createObjectURL(blob)
            console.log('We made it')
        }
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