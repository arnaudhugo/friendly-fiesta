import datetime
import json
import logging
import uuid
from .rethink import get_conn, r

logging.basicConfig(format='%(asctime)s %(message)s', datefmt='[ %m/%d/%Y-%I:%M:%S%p ]')

class registry_key:
    def __init__(self, id = -1):
        self.id = str(id) #registrery id
        self.last_check = None
        self.red = get_conn().db("auth").table('registry_key')
        self.d = None
        self.model = {
            "registry_id": None,
            "user_id": None,
            "name": None,
            "key": None,
            "active": None,
            "date": None,
            "authorized_ip": None
        }

    def add(self, name, user_id, registry_id):
        if self.id == str(-1):
            return [False, "Invalid registry", 400]
        if not isinstance(name, str):
            return [False, "Invalid type for name", 400]
        if not len(name) < 30:
            return [False, "Name should be less than 30 char", 400]
        key = str(uuid.uuid4()).replace('-', '')
        #while self.__exist(key):
        #    key = str(uuid.uuid4()).replace('-', '')
        date = str(datetime.datetime.utcnow())
        data = self.model
        data["registry_id"] = registry_id
        data["user_id"] = user_id
        data["name"] = name
        data["key"] = key
        data["date"] = date
        data["active"] = True
        data["authorized_ip"] = []
        res = dict(self.red.insert([data]).run())
        id = res["generated_keys"][0]
        return [True, {"id": id}, None]

    def delete(self, id, shared, user_id):
        if self.id == str(-1):
            return [False, "Invalid registry", 400]
        key = self.red.get(id).run()
        if  key is None:
            return [False, "Invalid key id", 404]
        if shared is False and user_id != key["user_id"]:
            return [False, "Not the owner of the key", 403]
        self.red.get(id).delete().run()
        return [True, {}, None]

    def get(self, shared, user_id, registry_id):
        """
            Allow users to retrieve register's keys
            if `!shared` only get the keys belonging to the current user

            GET /registry/<>/keys
        """
        if self.id == str(-1):
            return [False, "Invalid registry", 400]
        if shared is False:
            ret = list(self.red.filter(
                (r.row["user_id"] == user_id)
                &
                (r.row["registry_id"] == self.id)
            ).run())
        else:
            try:
                ret = list(self.red.filter(
                    (r.row["registry_id"] == self.id)
                ).run())
            except:
                return [False, "error", 500]
        return [True, {"keys": ret}, None]

    def check(self, key, ip):
        if not isinstance(key, str):
            return [False, "Invalid key format", 400]
        if not isinstance(ip, str):
            return [False, "Internal forward error", 500]
        res = (list(self.red.filter(
            lambda k:
		          (key == k["key"])
		          &
		          (k["active"] == True)
        ).run()))
        if len(res) != 1:
            return [False, "Invalid key", None]
        registry = res[0]["registry_id"]
        return [True, {'registry': registry}, None]
