from bson import ObjectId
from pymongo import MongoClient, errors


def required_fields(model, values):
    """
    remove all fields which not exist in model
    :param model:
    :param values: fields from form
    :return:
    """
    if values:
        for k in list(values):
            if k not in model.__table__.columns.keys():
                values.pop(k)
    return values


class DB(object):
    client = MongoClient("mongodb://127.0.0.1:27017")
    mydb = client.mymongodb

    def init(self):
        DB()

    @staticmethod
    def insert(collection, data):
        """inserting values for item to DB"""
        try:
            rec = DB().mydb[collection].insert(data)
        except errors.BulkWriteError as e:
            print(f'e------>{e}')
        else:
            return rec

    @staticmethod
    def find_one(collection, query):
        """get one element from DB"""
        try:
            DB().mydb[collection].find_one(query)
        except Exception as e:
            print(e)
        else:
            return True

    @staticmethod
    def find(collection):
        """get all elements from DB"""
        try:
            DB().mydb[collection].find()
        except Exception as e:
            print(e)
        else:
            return True

    @staticmethod
    def update(collection, data, id):
        """update data for element by id"""
        try:
            DB().mydb[collection].update({"_id": ObjectId(id)}, {"$set": data})
        except Exception as e:
            print(e)
        else:
            return True

    @staticmethod
    def insert_many(collection, data):
        """inserting values for items to DB"""
        try:
            rec = DB().mydb[collection].insert_many(data)
        except errors.BulkWriteError as e:
            print(f'e------>{e}')
        else:
            return rec
