from collections import OrderedDict

from pymongo.errors import BulkWriteError

from database import DB
from models.withdrawn_stuff import WithdrawnStuff


class Users(object):
    def __init__(self):
        cols = DB().mydb.collection_names()
        if 'user' not in cols:
            users = self.create_table_users

    def insert_data(self, values):
        """
        Function to insert/update users data
        :param values: users parameters
        :return:
        """

        user = DB.find_one("user", {'first_name': values.get('first_name'),
                                     'last_name': values.get('last_name')})
        if not user:
            res = DB.insert(collection="users", data=values)
        else:
            res = DB.update(collection="users", data=values, id=user.id)

        return res

    def create_table_users(self):
        try:
            DB().mydb.create_collection("users")

            vexpr = {"$jsonSchema":
                {
                    "bsonType": "object",
                    "required": ["first_name", "last_name", "birth_date",
                                 "marital_relationship", "address", "phone",
                                 "height", "eye_color", "withdrawn_stuff",
                                 "status"],
                    "properties": {
                        "first_name": {
                            "bsonType": "string",
                            "description": "must be a string and is required"
                        },
                        "last_name": {
                            "bsonType": "string",
                            "description": "must be a string and is not required"
                        },
                        "address": {
                            "bsonType": "string",
                            "description": "must be a string and is not required"
                        },

                        "withdrawn_stuff": {
                            "enum": ['drugs', 'guns', 'forbidden literature', None],
                            "description": "can only be one of the enum values and is required"
                        },
                    }
                }
            }

            query = [('collMod', 'users'),
                     ('validator', vexpr),
                     ('validationLevel', 'moderate')]
            query = OrderedDict(query)
            DB().mydb.command(query)
        except BulkWriteError as bwe:
            print(bwe.details)


