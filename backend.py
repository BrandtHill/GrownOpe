from flask import Flask, request, abort
import smtplib
import json
import requests
import configparser
import datetime
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.audio import MIMEAudio

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024 * 25

config = configparser.ConfigParser()
config.read('conf/backend.conf')
EMAIL = config['DEFAULT']['EMAIL']
PASSWORD = config['DEFAULT']['PASSWORD']
SECRET_KEY = config['DEFAULT']['SECRET_KEY']

audio_map = {
    'mp3':'mpeg',
    'm4a':'mp4',
    'mp4':'mp4',
    'wav':'wav',
    'ogg':'ogg',
    'weba':'webm'
}

@app.route('/contact', methods=['POST'])
def contact():
    print(request.form)
    ver_res = verify_recaptcha(request.form.get('g-recaptcha-response'), request.remote_addr)
    if (not ver_res['success']): return 'You are a robot. Contact not made.'
    msg = MIMEText('Name: {}\nEmail: {}\nIP: {}\n\nMessage: {}'.format(request.form.get('name'), request.form.get('email'), request.remote_addr, request.form.get('message')), 'plain', 'utf-8')
    msg['Subject'] = 'grownope.com: Message from ' + request.form.get('name')
    msg['From'] = EMAIL
    msg['To'] = EMAIL
    return send_email_message(msg)

@app.route('/voicemail', methods=['POST'])
def voicemail_upload():
    if request.form.get('name') == 'debug':
        time.sleep(2)
        return 'debug', 500
    tmp_file = request.files.get('audioblob')
    print(request.form)
    print(tmp_file)
    ver_res = verify_recaptcha(request.form.get('g-recaptcha-response'), request.remote_addr)
    if (not ver_res['success']): return 'You are a robot. Contact not made.'
    msg = MIMEMultipart()
    msg['Subject'] = 'grownope.com: Voicemail from ' + request.form.get('name')
    msg['From'] = EMAIL
    msg['To'] = EMAIL
    subtype = audio_map[tmp_file.filename.split('.')[-1]]
    audio_attachment = MIMEAudio(tmp_file.read(), subtype)
    audio_attachment.add_header('Content-Disposition', 'attachment', filename = tmp_file.filename)
    msg.attach(audio_attachment)
    msg.attach(MIMEText('Received an audiofile {} from IP {}'.format(tmp_file.filename, request.environ.get('HTTP_X_REAL_IP', request.remote_addr))))
    return send_email_message(msg)

def verify_recaptcha(response_token, ip_addr):
    return json.loads(requests.post('https://www.google.com/recaptcha/api/siteverify?secret={}&response={}&remoteip={}'.format(SECRET_KEY, response_token, ip_addr)).text)

def send_email_message(msg):
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.send_message(msg)
        server.close()
    except Exception as e:
        print('Email not sent successfully:')
        print(e)
        return 'An error occurred whilst trying to send an email.', 500
    return 'Success'

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
