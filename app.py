import os
from flask import Flask
from flask_wtf.csrf import CSRFProtect
from dotenv import load_dotenv
from flask_restful import Api, Resource, reqparse

from database import DB
from models.user_api import UserApi
from routes import main_routes

root_dir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(root_dir, '.env'))

app = Flask(__name__)

app.config['WTF_CSRF_HEADERS'] = ['X-CSRFToken', 'X-CSRF-Token']
app.config['SERVER_NAME'] = 'localhost:5050'
app.config['SECRET_KEY'] = os.environ['secret_key']
app.register_blueprint(main_routes.m_bp)
csrf = CSRFProtect(app)

api = Api(app, decorators=[csrf.exempt])

# for route in api_routes.routes:
#     print(route)

api.add_resource(UserApi, '/api/user')
# api.add_resource(ModelApi, '/api/users')


@app.before_first_request
def init_db():
    DB().init()


if __name__ == "__main__":
    app.run(debug=1, use_reloader=True, ssl_context='adhoc')
