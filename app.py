from flask import Flask, jsonify,request
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

@app.route('/categories', methods=['GET'])
def get_category():
    cur = mysql.connection.cursor()
    cur.execute('''
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'Category_ID', id,
                'Category', Display_Text,
                'Category_Description', Description
            )
        ) AS Categories
        FROM Category
    ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data[0])

@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.json
    firstname = data.get('firstname')
    id = data.get('email')
    lastname = data.get('lastname')
    print(id,firstname,lastname)

    cur = mysql.connection.cursor()
    cur.execute('''
        INSERT INTO User (id, First_Name, Last_Name)
        VALUES (%s, %s, %s)
    ''', (id,firstname,lastname))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'User added successfully'})


@app.route('/products/<string:category>')
def get_product(category):
    cur = mysql.connection.cursor()
    cur.execute('''
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'Product_Id', p.id,
                'Product_Name', p.Name,
                'Product_Description', p.Description,
                'Product_Brand', b.Name,
                'Product_Price', pii.Price,
                'Product_Image', pi.Image
            )
        ) AS Products
        FROM Product p
        INNER JOIN Category c ON p.Categories_Id = c.id
        INNER JOIN Brand b ON p.Brand_Id = b.id
        INNER JOIN Product_Images pi ON p.id = pi.Linked_Product_Id
        INNER JOIN Product_Inventory pii ON p.id = pii.Linked_Product_Id
        WHERE c.Display_Text = %s
        AND p.Out_of_Stock = 0
    ''', ((category),))
    data = cur.fetchall()
    cur.close()
    return jsonify(data[0])

@app.route('/add_cart_item', methods=['POST'])
def add_cart_item():
    data = request.json
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    quantity = data.get('quantity')

    cur = mysql.connection.cursor()
    try:
        # Check if the item already exists in the cart
        cur.execute('SELECT id FROM Cart_Session WHERE User_Id = %s', (user_id,))
        session_id = cur.fetchone()

        if session_id is None:
            # If session does not exist, create session in the Cart_Session table
            cur.execute('INSERT INTO Cart_Session (User_Id) VALUES (%s)', (user_id,))
            mysql.connection.commit()
            session_id = cur.lastrowid
        else:
            session_id = session_id[0]

        # Check if the item already exists in the cart for the given session
        cur.execute('SELECT id FROM Cart_Item WHERE Linked_Product_Id = %s AND Linked_Cart_Session_Id = %s',
                    (product_id, session_id))
        existing_item = cur.fetchone()

        if existing_item:
            return jsonify({'message': 'Item already in the cart'})

        # Add cart item to the Cart_Item table
        cur.execute('INSERT INTO Cart_Item (Quantity, Linked_Product_Id, Linked_Cart_Session_Id) VALUES (%s, %s, %s)',
                    (quantity, product_id, session_id))
        mysql.connection.commit()
        
        return jsonify({'message': 'Cart item added successfully', 'session_id': session_id})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()


if __name__ == '__main__':
    app.run(debug=True)