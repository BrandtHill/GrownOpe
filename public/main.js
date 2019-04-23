window.addEventListener('load', () => {

    var forms = document.getElementsByTagName('form')

    for (let f of forms) {
        f.addEventListener('submit', e => {
            e.preventDefault()
            grecaptcha.execute(recaps[f.id.replace('Form', '')])
            //sendData(f)
        })
    }

    var audioInput
    var audioInit = false
    var context
    var audioRecorder
    var recordStart = document.getElementById('recordStart')
    var recordStop = document.getElementById('recordStop')
    var player = document.getElementById('player')

    recordStart.disabled = false

    let onMicStream = (stream) => {
        audioInput = context.createMediaStreamSource(stream)
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
    }

    let setRecorderCallbacks = (ar) => {
        ar.onComplete = (r, b) => {
            blobs.voicemail = {
                name: 'audioblob',
                blob: b,
                filename: '_' + Date.now() + '.mp3'
            }
            player.src = URL.createObjectURL(blobs.voicemail.blob)
            console.log(blobs.voicemail)
        }
    }

})

var sendData = (form) => {
    var XHR = new XMLHttpRequest()
    let formName = form.id.replace('Form', '')

    XHR.addEventListener('load', (event) => console.log(event.target.responseText))
    XHR.addEventListener('error', (event) => console.log("Something went awry! " + event.target.responseText))

    XHR.open('POST', 'https://' + window.location.hostname + '/' + formName)

    let fd = new FormData(form)
    
    if (blobs[formName].blob) {
        fd.append(blobs[formName].name, blobs[formName].blob, fd.get('name').replace(/\s+/g,'') + blobs[formName].filename)
    }

    XHR.send(fd)

    button = document.getElementById(formName + 'Button')
    button.innerText = 'Submitted'
    button.disabled = true
}

let recaps = {}

let blobs = {}

var onloadCallback = () => {
    recaps.contact = grecaptcha.render('contactRecap', {'callback': () => sendData(document.getElementById('contactForm'))}, true)
    recaps.voicemail = grecaptcha.render('voicemailRecap', {'callback': () => sendData(document.getElementById('voicemailForm'))}, true)
}