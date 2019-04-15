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
    var recorder
    var recordStart = document.getElementById('recordStart')
    var recordStop = document.getElementById('recordStop')
    var player = document.getElementById('player')
    
    navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
        recorder = new MediaRecorder(stream)
        recorder.ondataavailable = e => {
            audioChunks.push(e.data)
            if (recorder.state == 'inactive') {
                let blob = new Blob(audioChunks, {type:'audio/mpeg-3'})
                player.src = URL.createObjectURL(blob)
            }
        }
        
        /*var context = new AudioContext()
        var source = context.createMediaStreamSource(stream)
        var processor = context.createScriptProcessor(1024, 1, 1)
        source.connect(processor)
        processor.connect(context.destination)
        processor.onaudioprocess = e => {

        }*/
    })

    recordStart.onclick = e => {
        audioChunks = []
        recorder.start()
    }

    recordStop.onclick = e => {
        recorder.stop()
    }

})

var sendData = (form) => {
    var XHR = new XMLHttpRequest()
    let formName = form.id.replace('Form', '')

    XHR.addEventListener('load', (event) => console.log(event.target.responseText))

    XHR.addEventListener('error', (event) => console.log("Something went awry! " + event.target.responseText))

    XHR.open('POST', 'http://localhost/' + formName)

    XHR.send(new FormData(form))

    button = document.getElementById(formName + 'Button')
    button.innerText = 'Submitted'
    button.disabled = true
}

let recaps = {}

var onloadCallback = () => {
    recaps.contact = grecaptcha.render('contactRecap', {'callback': () => sendData(document.getElementById('contactForm'))}, true)
    recaps.voicemail = grecaptcha.render('voicemailRecap', {'callback': () => sendData(document.getElementById('voicemailForm'))}, true)
}