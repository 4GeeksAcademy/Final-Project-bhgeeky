"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Products, Favorites, Checkout, ShoppingCart
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import joinedload
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
import datetime
import stripe
import os

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


def get_optional_jwt_identity():
    try:
        verify_jwt_in_request()
        return get_jwt_identity()
    except Exception:
        return None



@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


#USER SETTINGS


@api.route('/user', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({"msg": "User not found"}), 404

        return jsonify(user.serialize()), 200
    
    

    except Exception as error:
        return jsonify({"error": str(error)}), 500


@api.route('/register', methods=['POST'])
def register():
    try:
        #datos del JSON
        email = request.json.get('email', None)
        user_name = request.json.get('user_name', None)
        password = request.json.get('password', None)
        first_name = request.json.get('first_name', None)
        last_name = request.json.get('last_name', None)
        phone = request.json.get('phone', None)
        address = request.json.get('address', None)
        is_active = request.json.get('is_active', True)

        if not email or not password or not user_name:
            return jsonify({'msg': 'Missing data' }), 400
        
        #verificar si existe el usuario
        check_user = User.query.filter_by(email=email).first()

        #si el usuario existe devolvemos un error
        if check_user:
            return jsonify({'msg': 'User already Exists'}), 400

        new_user = User(
            email=email,
            password=generate_password_hash(password),
            user_name=user_name,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            address=address,
            is_active=is_active
        )

        db.session.add(new_user)
        db.session.commit()

        #se crea un token para el nuevo usuario
        expires = datetime.timedelta(days=1)
        access_token = create_access_token(identity=str(new_user.id), expires_delta=expires)    


        return {'msg': 'okey', 'token': access_token, 'user': new_user.serialize()}, 201

    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)}), 400


@api.route('/user/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    try:
        # Obtener el ID del usuario autenticado
        current_user_id = get_jwt_identity()

        # Verificar que el usuario autenticado es el mismo que el que intenta editar
        if int(current_user_id) != user_id:
            return jsonify({'msg': 'Unauthorized: cannot edit another user'}), 403

        # Obtener usuario desde la base de datos
        user = User.query.get(user_id)
        if not user:
            return jsonify({'msg': 'User not found'}), 404

        # Extraer datos del request (usando strings como claves)
        user_name = request.json.get('user_name')
        first_name = request.json.get('first_name')
        last_name = request.json.get('last_name')
        phone = request.json.get('phone')
        address = request.json.get('address')

        # Asegurarse de que al menos uno sea proporcionado
        if not any([user_name, first_name, last_name, phone, address]):
            return jsonify({'msg': 'No data provided for update'}), 400

        # Actualizar campos si se proporcionan
        if user_name:
            user.user_name = user_name
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name
        if phone:
            user.phone = phone
        if address:
            user.address = address

        # Guardar cambios
        db.session.commit()


        return jsonify({'msg': 'User updated successfully', 'user': user.serialize()}), 200

    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)}), 400


@api.route('/user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        #identificar el usuario
        id = get_jwt_identity()
        user = User.query.get(id)
        if not user:
            return jsonify({'msg' : 'User not found'}), 400
        if user.id != user_id:
            return jsonify({'msg' : 'Error, you can only delete your own account'}), 400
        
        #delete user
        db.session.delete(user)
        db.session.commit()


        return jsonify({'msg': 'User deleted successfully'}), 200
    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)}), 400
    

@api.route('/users', methods=['GET'])
def get_users():
    try:
        #dar todos los usuarios
        users = User.query.all()
        users_list = [user.serialize() for user in users]

        return jsonify(users_list), 200
    
    except Exception as error:
        return jsonify({'error' : str(error)}), 400


@api.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        #dar un solo user por su id
        user = User.query.get(user_id)

        #comprobacion de que existe el usuario
        if not user:
            return jsonify({'msg' : 'User not found'}), 400
        
        return jsonify(user.serialize()), 200
    
    except Exception as error:
        return jsonify({'error' : str(error)}), 400


#USER LOGIN


@api.route('/login', methods=['POST'])
def user_login():
    try:
        # Extraer la información del JSON
        email = request.json.get('email', None)
        password = request.json.get('password', None)

        # Comprobar que se haya enviado toda la información necesaria
        if not email or not password:
            return jsonify({'msg': 'Missing data'}), 400
        
        # Comprobar si existe un usuario con el correo proporcionado
        check_user = User.query.filter_by(email=email).first()

        if check_user is None:
            return jsonify({'msg': 'User not found'}), 404

        # Verificar si la contraseña ingresada coincide con el hash almacenado en la base de datos
        if not check_password_hash(check_user.password, password):
            return jsonify({'msg': 'Incorrect password'}), 400

        # Si la contraseña es correcta, generar el token de acceso
        expires = datetime.timedelta(days=1)
        access_token = create_access_token(identity=str(check_user.id), expires_delta=expires)

        # Retornar la respuesta con el token y los datos del usuario
        return jsonify({'msg': 'ok', 'token': access_token, 'user': check_user.serialize()}), 200

    except Exception as error:
        # Manejar cualquier error que pueda ocurrir
        return jsonify({'error': str(error)}), 500
    
#PRODUCTS

@api.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    print(request.json)
    try:
        #extraer detalles de productos de la request
        name = request.json.get('name', None)
        description = request.json.get('description', None)
        img = request.json.get('img', None)
        brand = request.json.get('brand', None)
        type = request.json.get('type', None)
        price = request.json.get('price', None)

        if not all([name or description or img or brand or type or price]):
            return jsonify({'msg': 'Fill all data'}),400
        
        #crear un producto
        new_product = Products(name=name, description=description, img=img, brand=brand, type=type, price=price)
        db.session.add(new_product)
        db.session.commit()

        return jsonify({'msg': 'product created successfully', 'product': new_product.serialize()}), 200
    
    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)}), 400
    

@api.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    try:
        #encontrar producto por id
        product = Products.query.get(product_id)
        if not product:
            return jsonify({'msg': 'Product not found'}, 400)
        
        #update product details
        product.name = request.json.get('name', product.name)
        product.description = request.json.get('description', product.description)
        product.img = request.json.get('img', product.img)
        product.brand = request.json.get('brand', product.brand)
        product.type = request.json.get('type', product.type)
        product.price = request.json.get('price', product.price)

        db.session.commit()

        return jsonify({'msg': 'product updated successfully', 'product': product.serialize()}), 200
    
    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)})
    

@api.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    try:
        #encontrar producto por id
        product = Products.query.get(product_id)
        if not product:
            return jsonify({'msg': 'Product not found'}), 404
        
        #borrar producto
        db.session.delete(product)
        db.session.commit()

        return jsonify({'msg': 'Product deleted successfully'}), 200
    
    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)})
    

@api.route('/products', methods=['GET'])
def get_products():
    try:
        #traer todos los productos
        products = Products.query.all()
        print(f"Found {len(products)} products in the database.")
        products_list = [
            {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'img': product.img,
                'brand': product.brand,
                'type': product.type,
                'price': product.price

            } for product in products
        ]

        return jsonify(products_list), 200
    
    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)})
    

@api.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    try:
        #traer un producto por su id
        product = Products.query.get(product_id)

        if not product:
            return jsonify({'msg': 'Product not found'}), 404
        
        product_data = [
            {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'img': product.img,
                'brand': product.brand,
                'type': product.type,
                'price': product.price 
            }
        ]

        return jsonify(product_data), 200
    
    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)})
    

##FAVORITES


@api.route('/favorites', methods=['POST'])
@jwt_required()
def add_to_favorites():
    try:
        id = get_jwt_identity()
        user = User.query.get(id) 

        if not user:
            return jsonify({'msg': 'User not found'}), 400
        
        # extraer product_id de la request
        product_id = request.json.get('product_id', None)

        #validar campos obligatorios
        if not product_id:
            return jsonify({'msg': 'Product ID is required'}), 400
        
        #comprobar que el favorito existe o no
        existing_favorite = Favorites.query.filter_by(user_id=id, product_id=product_id). first()
        if existing_favorite:
            db.session.delete(existing_favorite)
            db.session.commit()
            return jsonify({'msg' : 'Product deleted'}), 200
        else:
            #añadir favorito
            new_favorite = Favorites(product_id=product_id, user_id=id)
            db.session.add(new_favorite)
            db.session.commit()

            updated_favorite = [fav.product_id for fav in user.favorites]
            return jsonify({'msg': 'Favorite created', 'updated_favorite': updated_favorite}), 200
        
    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)})
    

@api.route('/favorites/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_favorite(product_id):
    try:
        id = get_jwt_identity()
        user = User.query.get(id)

        if not user:
            return jsonify({'msg': 'User not found'}), 400
        
        if not id:
            return jsonify({'msg': 'ID Required'}), 400
        
        #encontrar el favorito
        favorite = Favorites.query.filter_by(product_id=product_id, user_id=id).first()
        if not favorite:
            return jsonify({'msg': 'favorite not found'}), 400

        #borrar de favoritos
        db.session.delete(favorite)
        db.session.commit()

        return jsonify({'msg': 'Favorite deleted successfully'}), 200

    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)})       


@api.route('/favorites', methods=['GET']) 
@jwt_required()
def get_favorites():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'msg':'User not found'}),400
        
        favorites = Favorites.query.filter_by(user_id=user_id).all()
        favorites_products_id = [favorite.product_id for favorite in favorites]

        favorites_products = Products.query.filter(Products.id.in_(favorites_products_id)).all()
        favorite_products_list = [product.serialize() for product in favorites_products]

        return jsonify({'favorite_products' : favorite_products_list}), 200
    
    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)})
    

#CHECKOUT


@api.route('/checkout', methods=['POST'])
@jwt_required()
def add_to_checkout():
    try: 

        user_id = get_jwt_identity()
        product_id = request.json.get('product_id', None)

        if not product_id or user_id:
            return jsonify({'msg': 'User ID and Product ID are Required'}), 400
        
        #comprobar si el producto está ya en el checkout
        existing_checkout_product = Checkout(user_id=user_id, product_id=product_id)
        
        if existing_checkout_product:
            return jsonify({'msg':'Product already in checkout'})
        
        #añadir producto a checkout
        new_checkout_product = Checkout(user_id=user_id, product_id=product_id)
        db.session.add(new_checkout_product)
        db.session.commit()

        return jsonify({'msg': 'Product added to checkout susccessfully'}), 200
    
    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)})
    

###SHOPPING CART


@api.route('/shopping-cart', methods=['GET'])
@jwt_required()
def get_shopping_cart():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'msg' : 'User not found'}), 400

        
        shopping_cart_items = ShoppingCart.query.filter_by(user_id=user_id).options(joinedload(ShoppingCart.product)).all()
        
        serialized_cart = [item.serialize() for item in shopping_cart_items]

        return jsonify({'shopping_cart_products': serialized_cart}), 200

    except Exception as error:
        print(f"Error en get_shopping_cart: {error}", exc_info=True)
        return jsonify({'error': str(error)}), 500
    


@api.route('/shopping-cart', methods=['POST'])
@jwt_required()
def add_to_shopping_cart():
    try:
        user_id = get_jwt_identity()
        product_id = request.json.get('product_id', None)
        
        quantity = request.json.get('quantity', 1)

        if not product_id:
            return jsonify({'msg': 'Product ID is required'}), 400

        
        existing_item = ShoppingCart.query.filter_by(user_id=user_id, product_id=product_id).first()

        if existing_item:
            
            existing_item.quantity += quantity
            db.session.commit()
            msg = 'Product quantity updated in shopping cart'
        else:
            
            new_item = ShoppingCart(
                user_id=user_id,
                product_id=product_id,
                quantity=quantity 
            )
            db.session.add(new_item)
            db.session.commit()
            msg = 'Product added to shopping cart'

        
        return jsonify({'msg': msg}), 200

    except Exception as error:
        print(f"Error en add_to_shopping_cart: {error}", exc_info=True)
        db.session.rollback()
        return jsonify({'error': str(error)}), 400

    

@api.route('/shopping-cart/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_from_shopping_cart(product_id):
    try:
        id = get_jwt_identity()
        user = User.query.get(id)

        if not user:
            return jsonify({'msg': 'User not found'}), 400
        
        if not id:
            return jsonify({'msg': 'ID Required'}), 400
        
        item = ShoppingCart.query.filter_by(user_id=id, product_id=product_id).first()
        if not item:
            return jsonify({'msg': 'item not found in shopping cart'}), 400
        
        #eliminar el producto del carrito
        db.session.delete(item)
        db.session.commit()

        return jsonify({'msg': 'Item removed from shopping cart successfully'}), 200
    
    except Exception as error:
        db.session.rollback()
        return jsonify({'error': str(error)}), 400
    

@api.route('/shopping-cart/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_shopping_cart(product_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'msg': 'User not found'}), 400

        new_quantity = request.json.get('quantity', None)
        
        
        if not isinstance(new_quantity, int) or new_quantity <= 0:
            return jsonify({'msg': 'Valid integer quantity greater than 0 is required'}), 400
        
        item = ShoppingCart.query.filter_by(user_id=user_id, product_id=product_id).first()

        if not item:
            return jsonify({'msg': 'Item not found in shopping cart'}), 404

        item.quantity = new_quantity
        db.session.commit()

        
        return jsonify({'msg': 'Shopping cart item quantity updated successfully'}), 200

    except Exception as error:
        print(f"Error en update_shopping_cart: {error}", exc_info=True)
        db.session.rollback()
        return jsonify({'error': str(error)}), 500
##STRIPE

@api.route('/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    try:
       
        user_id = get_jwt_identity()

        
        user = User.query.get(user_id) 
        
        if not user:
            
            print(f"DEBUG: Usuario no encontrado para ID: {user_id}")
            return jsonify({'error': 'Usuario no encontrado. Por favor, inicia sesión de nuevo.'}), 404 # O 400

        cart_items = ShoppingCart.query.filter_by(user_id=user_id).options(joinedload(ShoppingCart.product)).all()

        if not cart_items:
            return jsonify({'msg': 'El carrito de compras está vacío.'}), 400

        line_items_for_stripe = []
        for item in cart_items:
            
            if not item.product:
                print(f"ADVERTENCIA: Producto con ID {item.product_id} no encontrado para el ítem del carrito {item.id}. Saltando este ítem.")
                continue 

            line_items_for_stripe.append({
                'price_data': {
                    'currency': 'usd', 
                    'product_data': {
                        'name': item.product.name, 
                        
                    },
                    
                    'unit_amount': int(float(item.product.price) * 100), 
                },
                'quantity': item.quantity, 
            })

        if not line_items_for_stripe:
            return jsonify({'msg': 'No se encontraron productos válidos en el carrito para procesar el pago.'}), 400
        print(f"DEBUGGING: Clave API siendo usada para Stripe.create: {stripe.api_key}")
        # Crear la sesión de Checkout de Stripe
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='payment',
            line_items=line_items_for_stripe, 
            success_url=os.environ.get('FRONTEND_SUCCESS_URL', 'https://tupagina.com/success'), 
            cancel_url=os.environ.get('FRONTEND_CANCEL_URL', 'https://tupagina.com/cancel'),
            
            customer_email=user.email if user.email else None 
        )

        return jsonify({'checkout_url': session.url}), 200 

    except Exception as e:
        
        print(f"ERROR: Error al crear la sesión de checkout: {e}") 
        return jsonify({'error': 'Error interno del servidor al crear la sesión de pago.'}), 500





        




        








        