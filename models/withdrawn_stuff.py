from collections import OrderedDict

from pymongo.errors import BulkWriteError

from database import DB


class WithdrawnStuff(object):
    def __init__(self):
        cols = DB().mydb.collection_names()
        if 'withdrawn_stuffs' not in cols:
            withdrawn_stuffs = self.create_table_withdrawn_stuffs()
            list_withdrawn_stuffs = [{'name': 'drugs'},
                                     {'name': 'guns'},
                                     {'name': 'forbidden literature'}]
            DB.insert_many(collection="withdrawn_stuffs",
                           data=list_withdrawn_stuffs)

    def create_table_withdrawn_stuffs(self):
        try:
            DB().mydb.create_collection("withdrawn_stuffs")
            vexpr = {"$jsonSchema":
                {
                    "bsonType": "object",
                    "required": ["name"],
                    "properties": {
                        "name": {
                            "bsonType": "string",
                            "description": "must be a string and is required"
                        },
                        "stuff": {
                            "enum": ['drugs', 'guns', 'forbidden literature',
                                     None],
                            "description": "can only be one of the enum values and is required"
                        },
                    }
                }
            }

            query = [('collMod', 'withdrawn_stuffs'),
                     ('validator', vexpr),
                     ('validationLevel', 'moderate')]
            query = OrderedDict(query)
            DB().mydb.command(query)
        except BulkWriteError as bwe:
            print(bwe.details)

    def get_withdrawn_stuffs(self):
        w_stuffs = list(DB.find(collection="withdrawn_stuffs"))
        return w_stuffs
