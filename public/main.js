window.addEventListener('load', () => {

    var forms = document.getElementsByTagName('form')

    for (let i = 0; i < forms.length; i++) {
        forms[i].addEventListener('submit', e => {
            e.preventDefault()
            grecaptcha.execute(recaps[forms[i].id.replace('Form', '')])
            //sendData(f)
        })
    }

    var audioInput
    var audioInit = false
    var context
    var audioRecorder
    var interval
    var recordStart = document.getElementById('recordStart')
    var recordStop = document.getElementById('recordStop')
    var player = document.getElementById('player')
    var mediaStream

    recordStart.disabled = false

    let onMicStream = (stream) => {
        mediaStream = stream
        audioInput = context.createMediaStreamSource(stream)
        audioRecorder = new WebAudioRecorder(audioInput, {
            workerDir: 'lib/',
            encoding: 'mp3',
            options: {
                timeLimit: 1200,
                mp3: {
                    bitRate: 160
                }
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
        player.src = ''
        document.getElementById('voicemailButton').innerText = 'Submit'
    }

    recordStart.onclick = e => {
        audioChunks = []
        audioLength = 0
        if (!audioInit) {
            try {initAudio()} catch(e) {alert('Your browser doesn\'t support the API for capturing microphone data.\niOS: Use Safari\nAndroid: Use Chrome\nDesktop: Use whatever')}
        }
        else {
            recording = true
            audioRecorder.startRecording()
            recordStart.disabled = true
            recordStop.disabled = false
            interval = setInterval(() => {
                recordStart.innerText = formatTimePretty(audioRecorder.recordingTime())
            }, 100)
        }
    }

    recordStop.onclick = e => {
        recordStop.disabled = true
        recordStart.disabled = false
        clearInterval(interval)
        recordStart.innerText = 'Restart'
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
            mediaStream.getTracks().forEach(track => track.stop())
            audioInit = false
        }
    }
})

var formatTimePretty = (num) => {
    let min = Math.floor(num/60)
    let sec = num % 60
    return (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec.toFixed(1) : sec.toFixed(1))
}

var sendData = (form) => {
    var XHR = new XMLHttpRequest()
    let formName = form.id.replace('Form', '')
    let button = document.getElementById(formName + 'Button')

    XHR.addEventListener('load', (event) => {
        console.log(event.target.responseText)
        if (event.target.status == 200) {
            button.innerText = 'Submitted'
            button.disabled = true
            setTimeout(() => button.disabled = false, 10000)
        } else {
            button.innerText = 'Error - Resubmit'
            button.disabled = false
        }
        
    })

    XHR.addEventListener('error', (event) => {
        console.log("Something went awry! " + event.target.responseText)
        button.innerText = 'Error - Resubmit'
        button.disabled = false
    })

    XHR.open('POST', 'https://' + window.location.hostname + '/' + formName)

    let fd = new FormData(form)
    
    if (blobs[formName].blob) {
        fd.append(blobs[formName].name, blobs[formName].blob, fd.get('name').replace(/\s+/g,'') + blobs[formName].filename)
    }

    XHR.send(fd)

    button.innerHTML = '<div class=\'loader\'></div>'
}

let recaps = {}

let blobs = {}

var onloadCallback = () => {
    recaps.contact = grecaptcha.render('contactRecap', {'callback': () => sendData(document.getElementById('contactForm'))}, true)
    recaps.voicemail = grecaptcha.render('voicemailRecap', {'callback': () => sendData(document.getElementById('voicemailForm'))}, true)
}