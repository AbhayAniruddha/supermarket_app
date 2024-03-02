from flask import Flask, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Sudeep12!@'
app.config['MYSQL_DB'] = 'supermarket'
mysql = MySQL(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/data', methods=['GET'])
def get_data():
    cur = mysql.connection.cursor()
    cur.execute('''SELECT JSON_ARRAYAGG(
    JSON_OBJECT(
        'Product_ID', p.id,
        'Product_Name', p.Name,
        'Product_Description', p.Description,
        'Out_of_Stock', p.Out_of_Stock,
        'Category', c.Display_Text,
        'Brand', b.Name
    )
)
FROM Product p
INNER JOIN Category c ON p.Categories_Id = c.id
INNER JOIN Brand b ON p.Brand_Id = b.id;

''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data[0])

if __name__ == '__main__':
    app.run(debug=True)