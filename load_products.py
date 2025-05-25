import json
from api.models import db, Products
from main import app

# Ruta a tu archivo JSON en /public
with open('./public/product.json', 'r') as f:
    products_data = json.load(f)

with app.app_context():
    for prod in products_data:
        new_product = Products(
            name=prod['name'],
            description=prod['description'],
            img=prod['img'],
            brand=prod['brand'],
            type=prod['type'],
            price=prod['price']
        )
        db.session.add(new_product)

    db.session.commit()
    print("Productos cargados correctamente.")