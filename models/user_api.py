from flask_restful import Resource, reqparse
from database import DB
from models.user import User
from settings import users_fields


class UserApi(Resource):
    def __init__(self):
        self.fields_from_collection_users = list(
            DB().mydb['users'].find({}, {'_id': False, 'id': False}).limit(1)[0])
        self.fields = self.fields_from_collection_users if self.fields_from_collection_users else users_fields

    def post(self):
        """This func. for create user data if user with such data("first_name",
         "last_name doesn't exist)
         :param Headers={Content-Type: application/json}, body: all required fields"""

        parser = reqparse.RequestParser()
        for field in self.fields:
            parser.add_argument(field)
        args = parser.parse_args()
        user = {}
        req_fields = []
        # collecting data from request fields
        for field in self.fields:
            # checking if all needed fields isset
            if args[field]:
                user[field] = args[field]
            else:
                req_fields.append(field)
        if req_fields:
            return f"This fields {', '.join(req_fields)} can`t be empty", 400
        # """ checking if user with such name alredy exist..
        #   it can be check by another unique fields..."""

        user_exist = DB.find_one("users", {'first_name': user['first_name'],
                                  'last_name': user['last_name']})
        if user_exist:
            return f"User with such name {user['first_name']} " \
                   f"{ user['last_name']} already exist", 400
        if user:
            create = User().insert_data(user)
            if create:
                return f"User {user['first_name']} Successfully created", 201
            else:
                return 'Not correct data', 400

    def get(self):
        """This func. for getting existing users data
        :param Headers={Content-Type: application/json}"""
        users = list(DB.find(collection="users", _id=False))
        if users:
            return users, 201
        else:
            return 'Users don`t exist, yet', 404

    def put(self):
        """This func. for update existing user data
        :param Headers={Content-Type: application/json}, body: some fields for updating
        :parameters
        """
        parser = reqparse.RequestParser()
        for field in self.fields:
            parser.add_argument(field)
        args = parser.parse_args()
        # we can search by id also, its depends with technical requirements
        if args.get('first_name') and args.get('last_name'):
            user_exist = DB.find_one("users", {'first_name': args.get('first_name'),
                                     'last_name': args.get('last_name')})
        if user_exist:
            user = {}
            for field in self.fields:
                if args[field]:
                    user[field] = args[field]
            DB.update(collection="users", data=user, id=user_exist['_id'])
            return f"Succesfully updated user, {user['first_name'], user['last_name']}", 202
        else:
            return 'No such user', 404
