from flask import Flask, request, abort

app = Flask(__name__, static_folder='../public/', root_path='../')

@app.route('/contact', methods=['POST'])
def contact():
    print(request.form)
    return '<h1>Contact Made</h1>'


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)