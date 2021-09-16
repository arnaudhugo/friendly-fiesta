import datetime
from .users import user
from .rethink import get_conn, r
from .registry_key import registry_key

class user_registry:
    def __init__(self, user, registry):
        self.user = user
        self.reg = registry
        if user is not None:
            self.user.data(True)
            self.usr_id = user.id
        if registry is not None:
            self.reg_id = registry.id
            self.roles = registry.roles
        if registry is not None and user is not None:
            self.keys = registry_key(self.reg.id)
        else:
            self.keys = registry_key()
        self.invite = False
        self.d = None
        self.red = get_conn().db("auth").table('user_registry')

    def all_from_user(self, usr_id, creator = True):
        res = self.red.filter(
                (r.row["id_user"] == usr_id)
            )
        if creator is False:
            res = res.filter(~r.row.has_fields({"roles": "creator"}))
        else:
            res = res.filter(r.row.has_fields({"roles": "creator"}))
        res = list(res.eq_join(
                'id_registry',
                get_conn().db("auth").table('registry')
            ).without(
                {'right': ["id"]}
            ).with_fields(
                'left', {'right': "name"}
            ).map( lambda res : {
                        "date": res['left']['date'],
                        "by": res['left']['by'],
                        "id": res['left']['id'],
                        "last_update": res['left']['date'],
                        "registry": {
                          "id": res['left']['id_registry'],
                          "name": res['right']['name'],
                          "roles": res['left']['roles'],
                        }
                    }
            ).run()
        )
        return [True, {"registries": res}, None]

    def all_user(self, reg_id):
        res = list(
            self.red.filter(
                (r.row["id_registry"] == reg_id)
            ).eq_join('id_user', get_conn().db("auth").table('users')
            ).without(
                {'right': ["id"]}
            ).with_fields(
                'left', {"right": 'username'}
            ).map( lambda res : {
                    "date": res['left']['date'],
                    "by": res['left']['by'],
                    "id": res['left']['id'],
                    "last_update": res['left']['date'],
                    "user": {
                      "id": res['left']['id_user'],
                      "username": res['right']['username'],
                      "roles": res['left']['roles'],
                    }
                }
            ).run()
        )
        return [True, {"users": res}, None]

    def data(self, id_user = None,update = False):
        id_user = id_user if id_user is not None else self.usr_id
        if id_user is None and self.invite is True:
            return {
                "id_registry": self.reg_id,
                "id_user": -1,
                "date": 0,
                "last_update": None,
                "roles": {
                    "others": {
                        "active": True,
                        "last_update": 0,
                        "by": None,
                    }
                },
                "by": self.usr_id
            }
        if ((self.d is None or update is True) and self.usr_id != "-1") or \
            id_user is None:
            d = self.red.filter(
                (r.row["id_user"] == id_user)
                & (r.row["id_registry"] == self.reg_id)
            ).run()
            d = list(d)
            if id_user is not None:
                if len(d) == 1:
                    return dict(d[0])
                else:
                    return None
            if len(d) == 1:
                self.d = dict(d[0])
            else:
                self.d = None
        return self.d

    def add_user(self, id_user, roles, email = None, force = False):
        if not (isinstance(roles, list) and all(isinstance(i, str) for i in roles)) and not isinstance(roles, str):
            return [False, "Invalid roles format", 400]
        if not isinstance(roles, list):
            roles = [roles]
        if len(roles) == 0:
            return [False, "Must add at least one role", 400]
        if str(self.usr_id) == str("-1"):
            return [False, "Invalid user", 401]
        if str(self.reg_id) == str("-1"):
            return [False, "Invalid registry", 401]
        base_roles = self.reg.roles()[1]
        base_roles = base_roles["builtin"] + base_roles["custom"]
        if not all(self.i in base_roles for self.i in roles):
            return [False, f"Invalid role: {self.i}", 400]
        if not force and not self.can("invite"):
            return [False, "User cannot invite other users", 401]
        if email is not None:
            u = user(-1, email)
            if u.id == "-1":
                u.invite(email)
                u = user(-1, email)
            id_user = u.id
        if id_user == "-1":
            return [False, "Invalid user", 401]
        if self.exist(id_user):
            return [False, "User already in registry", 401]
        date = str(datetime.datetime.now())
        res = dict(self.red.insert([{
            "id_registry": self.reg_id,
            "id_user": id_user,
            "date": date,
            "last_update": None,
            "roles": {},
            "by": self.usr_id
        }]).run())
        for role in roles:
            self.__status(id_user, role)
        id = res["generated_keys"][0]
        return [True, {"id": id}, None]

    def froles(self, id_user = None, active = None):
        id_user = id_user if id_user is not None else self.usr_id
        d = self.data(id_user)
        if d is None:
            return [False, "Invalid user", 400]
        roles = list(d["roles"].keys())
        if active != None:
            to_del = []
            for i in roles:
                if d["roles"][i]["active"] != active:
                    to_del.append(i)
            for i in to_del:
                roles = list(filter((i).__ne__, roles))
        return [True, {"roles": roles}, None]

    def has_role(self, role, id_user = None, active = True):
        id_user = id_user if id_user is not None else self.usr_id
        r = self.froles(id_user, active)
        return role in r[1]["roles"] if r[0] else False

    def actions(self, id_user = None):
        id_user = id_user if id_user is not None else self.usr_id
        r = self.froles(id_user, True)
        if not r[0]:
            return r
        d = self.reg.data()
        ret = []
        for i in r[1]["roles"]:
            if i in d["roles"]["builtin"]["main"]:
                ret.extend(d["roles"]["builtin"]["main"][i]["actions"])
            elif i in d["roles"]["custom"]["main"]:
                ret.extend(d["roles"]["custom"]["main"][i]["actions"])
        return [True, {"actions": list(set(ret))}, None]

    def can(self, action, id_user = None):
        id_user = id_user if id_user is not None else self.usr_id
        a = self.actions(id_user)
        return action in a[1]["actions"] if a[0] else False

    def exist(self, id_user = None, end = False):
        if id_user is None:
            if self.d != None:
                return True
            res = list(self.red.filter((r.row["id_user"] == self.usr_id) & (r.row["id_registry"] == self.reg_id)).run())
            if len(res) == 1:
                self.d = res[0]
            if len(res) > 0:
                if end is True:
                    return [True, self.d, None]
                return True
            if end is True:
                self.invite = True
                return [True, {}, None]
        else:
            res = list(self.red.filter((r.row["id_user"] == id_user) & (r.row["id_registry"] == self.reg_id)).run())
            if len(res) > 0:
                if end is True:
                    return [True, res[0], None]
                return True
            if end is True:
                return [False, "Invalid user for this registry", 404]
        return False

    def add_key(self, name):
        return self.keys.add(name, self.usr_id, self.reg_id)

    def delete_key(self, id):
        shared = self.reg.data()["dev_settings"]["keys"]["main"]["shared"]
        return self.keys.delete(id, shared, self.usr_id)

    def get_keys(self):
        shared = self.reg.data()["dev_settings"]["keys"]["main"]["shared"]
        return self.keys.get(shared, self.usr_id, self.reg_id)

    def check_key(self, key, ip):
        return self.keys.check(key, ip)

    def __status(self, id_user, role, active = True):
        roles = self.reg.roles()[1]
        roles = roles["builtin"] + roles["custom"]
        role = str(role)
        if role not in roles:
            return False
        date = str(datetime.datetime.now())
        roles = list(self.red.filter(
            (r.row["id_user"] == id_user) & (r.row["id_registry"] == self.reg_id)
        ).run())
        id = roles[0]["id"]
        roles = roles[0]["roles"]
        if role not in roles:
            self.red.get(id).update({
                "roles": {
                    role: {
                        "active": active,
                        "last_update": date,
                        "by": self.usr_id,
                    }
                },
                "last_update": date
            }).run()
            ret = True
        else:
            ret = dict(self.red.get(id).update({
                "roles": {
                    role: {
                        "active": active,
                        "last_update": date,
                        "by": self.usr_id
                    }
                },
                "last_update": date
            }).run())["skipped"] == 0
        return ret
