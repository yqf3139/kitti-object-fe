from flask import Flask
from flask import jsonify
from flask import send_file
from flask import request
from os import listdir, path
from flask_cors import CORS, cross_origin
import pandas as pd
import uuid
import threading
import subprocess

app = Flask(__name__)
CORS(app)

lock = threading.Lock()

def make_error_resp(msg, code):
    return jsonify({ 'msg': msg }), code

def params_error(category, name):
    if category not in ['car']:
        return make_error_resp("Category not fond", 404)
    if name not in ['testing', 'training', 'evaluating']:
        return make_error_resp("Gallery name not fond", 404)
    return None

def get_items(category, name):
    return [f[:6] for f in listdir(path.join(name, 'label_2'+category)) if f.endswith('.txt')]

def detect(category, idx):
    lock.acquire()
    p = subprocess.run(["./python", "./detect.py", category, idx])
    retcode = p.returncode
    lock.release()
    return retcode == 0

@app.route("/gallery/<category>/<name>", methods=['GET'])
def list_gallery(category=None, name=None):
    error = params_error(category, name)
    if error is not None:
        return error

    return jsonify(get_items(category, name))

@app.route("/gallery/<category>/<name>/<idx>/img", methods=['GET'])
def get_img(category=None, name=None, idx=None):
    error = params_error(category, name)
    if error is not None:
        return error
    p = path.join(name, 'image_2', str(idx)+'.png')
    if not path.isfile(p):
        return make_error_resp('File not fond', 404)

    return send_file(p, mimetype='image/png')


@app.route("/gallery/<category>/<name>/<idx>/objects", methods=['GET'])
def get_objects(category=None, name=None, idx=None):
    error = params_error(category, name)
    if error is not None:
        return error
    p = path.join(name, 'label_2'+category, str(idx)+'.txt')
    if not path.isfile(p):
        return make_error_resp('File not fond', 404)

    df = pd.read_csv(p, sep=' ', header=None)
    if 15 not in df.columns:
        df[15] = 1

    data = df[[0,4,5,6,7,15]]
    data.columns = ['type', 'b1', 'b2', 'b3', 'b4', 'pred']
    return jsonify(data.to_dict(orient='records'))

@app.route("/gallery/<category>/evaluating/new/img", methods=['POST'])
def process_img(category=None, idx=None):
    error = params_error(category, "evaluating")
    if error is not None:
        return error
    file = request.files['file']
    idx = str(uuid.uuid4())
    file.save(path.join("evaluating", "image_2", idx+".png"))
    if detect(category, idx):
        return jsonify({'idx':idx})
    return make_error_resp("Errors occured when detecting", 500)

if __name__ == "__main__":
    app.run()
