from lcore import Lcore

app = Lcore()

@app.route('/hello')
def hello():
    return {'message': 'Hello, World!'}

app.run(host='0.0.0.0', port=8080)