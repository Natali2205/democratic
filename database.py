import pymongo

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
            data['id'] = DB().get_next_id(collection)
            res = DB().mydb[collection].insert(data)
        except errors.BulkWriteError as e:
            print(f'e------>{e}')
            return False
        else:
            return res

    @staticmethod
    def find_one(collection, query):
        """get one element from DB"""
        try:
            res = DB().mydb[collection].find_one(query)
        except Exception as e:
            print(e)
            return False
        else:
            return res

    @staticmethod
    def find(collection='collection', **kwargs):
        """get all elements from DB"""
        try:
            if kwargs:
                res = DB().mydb[collection].find({}, kwargs)
            else:
                res = DB().mydb[collection].find()
        except Exception as e:
            print(e)
            return False
        else:
            return res

    @staticmethod
    def update(collection, data, id):
        """update data for element by id"""
        try:
            DB().mydb[collection].update({"_id": ObjectId(id)}, {"$set": data})
        except Exception as e:
            print(e)
            return False
        else:
            return True

    @staticmethod
    def insert_many(collection, data):
        """inserting values for items to DB"""
        try:
            DB().mydb[collection].insert_many(data)
        except errors.BulkWriteError as e:
            print(f'e------>{e}')
            return False
        else:
            return True

    def get_next_id(self, collection):
        result = DB().mydb[collection].find_one({}, sort=[
            ("id", pymongo.DESCENDING)])
        if result:
            id = result['id']
            id += 1
        else:
            id = 1
        return id

    # @staticmethod
    # def get_columns(self, collection):
    #     reduce(lambda all_keys, rec_keys: all_keys | set(rec_keys),
    #            map(lambda d: d.keys(), DB().mydb[collection].find()), set())
