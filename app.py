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

@app.route('/add_category', methods=['POST'])
def add_category():
    data = request.json
    displaytext = data.get('displaytext')
    desc = data.get('desc')
    
    cur = mysql.connection.cursor()
    cur.execute('''
        INSERT INTO Category (Display_Text, Description)
        VALUES (%s, %s)
    ''', (displaytext,desc))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Category added successfully'})

@app.route('/delete_category', methods=['POST'])
def delete_category():
    data = request.json
    id = data.get('id')
    
    cur = mysql.connection.cursor()
    cur.execute('''
        DELETE FROM Category WHERE id = %s
    ''', (id,))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Category deleted succesfully'})



@app.route('/brands', methods=['GET'])
def get_brand():
    cur = mysql.connection.cursor()
    cur.execute('''
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'Brand_ID', id,
                'Brand', Name
            )
        ) AS Brands
        FROM Brand
    ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data[0])

@app.route('/add_brand', methods=['POST'])
def add_brand():
    data = request.json
    brand = data.get('brand')
    
    cur = mysql.connection.cursor()
    cur.execute('''
        INSERT INTO Brand (Name)
        VALUES (%s)
    ''', (brand,))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Brand added successfully'})

@app.route('/delete_brand', methods=['POST'])
def delete_brand():
    data = request.json
    id = data.get('id')
    
    cur = mysql.connection.cursor()
    cur.execute('''
        DELETE FROM Brand WHERE id = %s
    ''', (id,))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Brand deleted succesfully'})


@app.route('/vendors', methods=['GET'])
def get_vendor():
    cur = mysql.connection.cursor()
    cur.execute('''
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'Vendor_ID', id,
                'Vendor', Name,
                'Vendor_Email', Email,
                'Vendor_Phone', Phone_Number,
                'Vendor_Website', Website_URL
            )
        ) AS Vendors
        FROM Vendor
    ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data[0])

@app.route('/add_vendor', methods=['POST'])
def add_vendor():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    web = data.get('web')
    
    cur = mysql.connection.cursor()
    cur.execute('''
        INSERT INTO Vendor (Name, Email, Phone_Number, Website_URL)
        VALUES (%s, %s, %s, %s)
    ''', (name, email, phone, web))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Vendor added successfully'})

@app.route('/delete_vendor', methods=['POST'])
def delete_vendor():
    data = request.json
    id = data.get('id')
    
    cur = mysql.connection.cursor()
    cur.execute('''
        DELETE FROM Vendor WHERE id = %s
    ''', (id,))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Vendor deleted succesfully'})


@app.route('/products', methods=['GET'])
def get_product():
    cur = mysql.connection.cursor()
    cur.execute('''
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'Product_Id', p.id,
                'Product_Name', p.Name,
                'Product_Description', p.Description,
                'Product_Stock', p.Out_of_Stock,
                'Product_Price', pii.Price,
                'Product_Quantity', pii.Quantity,
                'Product_Image', pi.Image,
                'Product_Alt', pi.ALT
            )
        ) AS Products
        FROM Product p
        INNER JOIN Category c ON p.Categories_Id = c.id
        INNER JOIN Product_Images pi ON p.id = pi.Linked_Product_Id
        INNER JOIN Product_Inventory pii ON p.id = pii.Linked_Product_Id
    ''')
    data = cur.fetchall()
    cur.close()
    return jsonify(data[0])

@app.route('/add_product', methods=['POST'])
def add_product():
    data = request.json
    name = data.get('p_name')
    desc = data.get('p_desc')
    price = data.get('price')
    quantity = data.get('quantity')
    image = data.get('image')
    alt = data.get('alt')
    brand_id = data.get('brand_id')
    category_id = data.get('category_id')
    vendor_id = data.get('vendor_id')
    
    cur = mysql.connection.cursor()
    # Insert into Product table
    cur.execute('''
        INSERT INTO Product (Name, Description, Out_of_Stock, Categories_Id, Brand_Id)
        VALUES (%s, %s, %s, %s, %s)
    ''', (name, desc, 0, category_id, brand_id))
    product_id = cur.lastrowid
    
    # Insert into Product_Inventory table
    cur.execute('''
        INSERT INTO Product_Inventory (Linked_Product_Id, Linked_Vendor_Id, Price, Quantity)
        VALUES (%s, %s, %s, %s)
    ''', (product_id, vendor_id, price, quantity))
    
    # Insert into Product_Images table
    cur.execute('''
        INSERT INTO Product_Images (Image, ALT, Linked_Product_Id)
        VALUES (%s, %s, %s)
    ''', (image, alt, product_id))
    
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'Product added successfully'})

   

@app.route('/delete_product', methods=['POST'])
def delete_product():
    data = request.json
    id = data.get('id')
    
    try:
        cur = mysql.connection.cursor()
        
        # Delete the image
        cur.execute('''
            DELETE FROM Product_Images WHERE Linked_Product_Id = %s
        ''', (id,))

        # Delete the inventory record
        cur.execute('''
            DELETE FROM Product_Inventory WHERE Linked_Product_Id = %s
        ''', (id,))

        # Delete the product
        cur.execute('''
            DELETE FROM Product WHERE id = %s
        ''', (id,))
        
        
        mysql.connection.commit()
        cur.close()

        return jsonify({'message': 'Product, inventory, and image deleted successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/update_product_quantity', methods=['POST'])
def update_product_quantity():
    data = request.json
    id = data.get('id')
    quantity = data.get('quantity')
    
    try:
        cur = mysql.connection.cursor()

        # Update the product
        cur.execute('''
            UPDATE Product_Inventory SET quantity = %s WHERE id = %s
        ''', (quantity,id))
        
        
        mysql.connection.commit()
        cur.close()

        return jsonify({'message': 'Product updated successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)})





@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.json
    firstname = data.get('firstname')
    id = data.get('email')
    lastname = data.get('lastname')
    mobile = data.get('mobile')


    cur = mysql.connection.cursor()
    cur.execute('''
        INSERT INTO User (id, First_Name, Last_Name, Mobile)
        VALUES (%s, %s, %s, %s)
    ''', (id,firstname,lastname,mobile))
    mysql.connection.commit()
    cur.close()

    return jsonify({'message': 'User added successfully'})


@app.route('/products/<string:category>')
def get_product_by_category(category):
    cur = mysql.connection.cursor()
    cur.execute('''
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'Product_Id', p.id,
                'Product_Name', p.Name,
                'Product_Description', p.Description,
                'Product_Brand', b.Name,
                'Product_Price', pii.Price,
                'Product_Image', pi.Image,
                'Product_Alt', pi.ALT
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



@app.route('/cart/update' , methods=['POST'])
def update_cart():
    data = request.json
    id = data.get('email')
    quantity = int(data.get('quantity'))
    name = data.get('name')
    cur = mysql.connection.cursor()
    cur.execute('''
        UPDATE Cart_Item ci
        INNER JOIN Cart_Session cs ON cs.id = ci.Linked_Cart_Session_Id
        INNER JOIN Product p ON p.id = ci.Linked_Product_Id  
        INNER JOIN Product_Inventory pi ON pi.Linked_Product_Id = ci.Linked_Product_Id
        SET ci.Quantity = %s
        WHERE cs.User_Id = %s AND p.Name = %s
    ''',(quantity,id,name))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Product price updated successfully'}), 200

@app.route('/cart/get' , methods=['POST'])
def get_cart_items():
    data = request.json
    id = data.get('email')
    cur = mysql.connection.cursor()
    cur.execute('''
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'Product_Name', p.Name,
                'Product_Description', p.Description,
                'Quantity', ci.Quantity,
                'Price', pi.Price,
                'MaxQuantity', pi.Quantity,
                'Product_Image', pimg.Image,
                'Product_Alt', pimg.ALT
            )
        ) AS Products
        FROM Cart_Item ci
        INNER JOIN Cart_Session cs ON cs.id = ci.Linked_Cart_Session_Id
        INNER JOIN Product p ON p.id = ci.Linked_Product_Id  
        INNER JOIN Product_Images pimg ON pimg.Linked_Product_Id = ci.Linked_Product_Id
        INNER JOIN Product_Inventory pi ON pi.Linked_Product_Id = ci.Linked_Product_Id
        WHERE cs.User_Id = %s  
    ''',(id,))
    data = cur.fetchall()
    cur.close()
    return jsonify(data[0])

@app.route('/cart/delete' , methods=['POST'])
def delete_cart_item():
    data = request.json
    id = data.get('email')
    name = data.get('name')
    cur = mysql.connection.cursor()
    cur.execute('''
        DELETE ci 
        FROM Cart_Item ci
        INNER JOIN Cart_Session cs ON cs.id = ci.Linked_Cart_Session_Id
        INNER JOIN Product p ON p.id = ci.Linked_Product_Id  
        INNER JOIN Product_Inventory pi ON pi.Linked_Product_Id = ci.Linked_Product_Id
        WHERE cs.User_Id = %s AND p.Name = %s
    ''',(id,name))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Item removed from cart successfully'}), 200

    
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


@app.route('/get_previous_orders', methods=['POST'])
def get_previous_orders():
    try:
        data = request.json
        user_id = data.get('user_id')
        print(user_id)

        cur = mysql.connection.cursor()
        cur.execute('''
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'Order_ID', po.id,
                    'Total', po.Total,
                    'Shipping_Address_Id', po.Shipping_Address_Id,
                    'Status', po.Status,
                    'Creation_Date', po.Creation_Date,
                    'Modified_Date', po.Modified_Date,
                    'Items', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'Product_Name', p.Name,
                                'Product_Description', p.Description,
                                'Quantity', oi.Quantity,
                                'Price', pi.Price
                            )
                        )
                        FROM Order_Item oi
                        INNER JOIN Product p ON p.id = oi.Linked_Product_Id
                        INNER JOIN Product_Inventory pi ON pi.Linked_Product_Id = oi.Linked_Product_Id
                        WHERE oi.Linked_Order_Id = po.id
                    )
                )
            ) AS Orders
            FROM PreviousOrder po
            WHERE po.User_Id = %s
        ''', (user_id,))
        
        orders_data = cur.fetchall()
        cur.close()

        if not orders_data:
            return jsonify({'message': 'No previous orders found'}), 404

        return jsonify(orders_data[0])

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    


@app.route('/move_to_previous_order', methods=['POST'])
def move_to_previous_order():
    data = request.json
    user_id = data.get('user_id')
    address_id = data.get('address_id')  # Assuming address_id is sent from the frontend
    cur = mysql.connection.cursor()

    try:

        # Move cart items to a new previous order
        cur.execute('''
            INSERT INTO PreviousOrder (Total, Shipping_Address_Id, Status, User_Id)
            VALUES (
                (SELECT SUM(pi.Price * ci.Quantity)
                FROM Cart_Item ci
                INNER JOIN Cart_Session cs ON ci.Linked_Cart_Session_Id = cs.id
                INNER JOIN Product_Inventory pi ON ci.Linked_Product_Id = pi.Linked_Product_Id
                WHERE cs.User_Id = %s),
                %s, 1, %s
            )
        ''', (user_id, address_id, user_id))

        # Get the ID of the newly inserted previous order
        cur.execute('SELECT LAST_INSERT_ID()')
        order_id = cur.fetchone()[0]


        # Move cart items to order items with the newly created order ID
        cur.execute('''
            INSERT INTO Order_Item (Quantity, Linked_Product_Id, Linked_Order_Id)
            SELECT ci.Quantity, ci.Linked_Product_Id, %s
            FROM Cart_Item ci
            INNER JOIN Cart_Session cs ON ci.Linked_Cart_Session_Id = cs.id
            WHERE cs.User_Id = %s
        ''', (order_id, user_id))

        # Decrease quantity in product inventory
        cur.execute('''
            UPDATE Product_Inventory pi
            INNER JOIN Cart_Item ci ON ci.Linked_Product_Id = pi.Linked_Product_Id
            INNER JOIN Cart_Session cs ON ci.Linked_Cart_Session_Id = cs.id
            SET pi.Quantity = pi.Quantity - ci.Quantity
            WHERE cs.User_Id = %s
        ''', (user_id,))
        
        # Delete cart items
        cur.execute('''
            DELETE FROM Cart_Item
            WHERE Linked_Cart_Session_Id IN (
                SELECT id FROM Cart_Session WHERE User_Id = %s
            )
        ''', (user_id,))

        # Delete cart session
        cur.execute('''
            DELETE FROM Cart_Session
            WHERE User_Id = %s
        ''', (user_id,))

        # Keep only the latest three previous orders for the user
        cur.execute('''
            DELETE FROM PreviousOrder
            WHERE User_Id = %s AND id NOT IN (
                SELECT id
                FROM (
                    SELECT id
                    FROM PreviousOrder
                    WHERE User_Id = %s
                    ORDER BY Creation_Date DESC
                    LIMIT 6
                ) AS temp
            )
        ''', (user_id, user_id))

        mysql.connection.commit()
        return jsonify({'message': 'Cart items moved to previous order successfully'})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': str(e)})
    finally:
        cur.close()



@app.route('/profile/get' , methods=['POST'])
def get_profile_info():
    data = request.json
    id = data.get('email')
    cur = mysql.connection.cursor()
    cur.execute('''
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'First_Name', u.First_Name,
                'Last_Name', u.Last_Name,
                'Mobile', u.Mobile
            )
        ) AS INFO
        FROM User u
        WHERE u.id = %s  
    ''',(id,))
    data = cur.fetchall()
    cur.close()
    return jsonify(data[0])



@app.route('/address/get' , methods=['POST'])
def get_address():
    data = request.json
    id = data.get('email')
    cur = mysql.connection.cursor()
    cur.execute('''
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'address_id', u.id,
                'address', u.Address,
                'postal_code', u.Postal_Code
            )
        ) AS ADDRESS
        FROM User_Address u
        WHERE u.User_Id = %s  
    ''',(id,))
    data = cur.fetchall()
    cur.close()
    return jsonify(data[0])

@app.route('/address/update' , methods=['POST'])
def update_address():
    data = request.json
    id = data.get('email')
    address = data.get('address')
    postal_code = data.get('postal_code')
    cur = mysql.connection.cursor()
    cur.execute('''
        INSERT INTO User_Address(Address,Postal_Code,User_Id) 
        VALUES (%s, %s, %s)
    ''',(address,postal_code,id))
    mysql.connection.commit()
    cur.close()
    return jsonify({'message': 'Address added successfully'}), 200

@app.route('/move_to_cart', methods=['POST'])
def move_to_cart():
    data = request.json
    order_id = data.get('order_id')
    user_id = data.get('user_id')  # Assuming user_id is sent from the frontend
    cur = mysql.connection.cursor()

    try:
        # Check if a cart session already exists for the user
        cur.execute('''
            SELECT id FROM Cart_Session WHERE User_Id = %s
        ''', (user_id,))
        existing_cart_session = cur.fetchone()
        
        if existing_cart_session:
            cart_session_id = existing_cart_session[0]
        else:
            # Create a new cart session for the user if one doesn't exist
            cur.execute('''
                INSERT INTO Cart_Session (User_Id) VALUES (%s)
            ''', (user_id,))
            cart_session_id = cur.lastrowid

        # Move order items to the cart session
        cur.execute('''
            INSERT INTO Cart_Item (Quantity, Linked_Product_Id, Linked_Cart_Session_Id)
            SELECT oi.Quantity, oi.Linked_Product_Id, %s
            FROM Order_Item oi
            WHERE oi.Linked_Order_Id = %s
        ''', (cart_session_id, order_id))

        mysql.connection.commit()
        return jsonify({'message': 'Items from previous order added to cart successfully'})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({'error': str(e)})
    finally:
        cur.close()

@app.route('/cart_total_items', methods=['POST'])
def get_cart_total_items():

    data = request.json
    user_id = data.get('id')
    cur = mysql.connection.cursor()
    cur.execute('''
        SELECT GetCartTotalItems(%s)
    ''', (user_id,))
    total_items = cur.fetchone()[0]
    cur.close()
    
    return jsonify({'total_items_in_cart': total_items}), 200

if __name__ == '__main__':
    app.run(debug=True)