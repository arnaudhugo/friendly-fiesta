import json, datetime
import jwt
import hashlib
import time
import os
import re
import phonenumbers
import string
import random
import uuid
import logging
try:
    from .rethink import get_conn, r
except:
    pass

secret_path = "./secret/"
logging.basicConfig(format='%(asctime)s %(message)s', datefmt='[ %m/%d/%Y-%I:%M:%S%p ]')
TOKEN_ARR = {}

class user:
    def public_key():
        with open(f'{secret_path}jwt-key.pub', 'r', encoding='utf-8') as file:
            public_key = file.read()
        return [True, {"public_key": public_key}, None]

    def __init__(self, id = -1, email = None):
        if id is None:
            id = -1
        self.id = str(id)
        try:
            self.red = get_conn().db("auth").table('users')
        except:
            self.red = None
        email = str(email)
        if email is not None:
            try:
                self.id = list(self.red.filter(r.row["email"]["main"] == email).run())[0]["id"]
            except:
                pass
        self.av_roles = ["creator", "admin", "user", "disabled", "invite"]
        self.scale_change_pass = {"limit": True, "scale": [0, 0, 0]}
        self.scale_verify_email = {"limit": False, "scale": [0, 0, 0, 1, 5, 10, 60, 120]}
        self.scale_verify_phone = {"limit": True, "scale": [0, 0]}
        self.d = None
        self.data()
        self.askable = {
         "id":
         lambda: self.data()['id'],
         "username":
         lambda : self.data()["username"]["main"],
         "email":
         lambda : self.data()["email"]["main"],
         "phone":
         lambda : self.data()["details"]["phone"]["main"],
         "first_name":
         lambda : self.data()["details"]["first_name"]["main"],
         "last_name":
         lambda : self.data()["details"]["last_name"]["main"],
         "age":
         lambda : self.data()["details"]["last_name"]["main"],
         "is_over_12":
         lambda : self.data()["details"]["age"]["main"] is not None and \
                  self.data()["details"]["age"]["main"] >= 12,
         "is_over_16":
         lambda : self.data()["details"]["age"]["main"] is not None and \
                  self.data()["details"]["age"]["main"] >= 16,
         "is_over_18":
         lambda : self.data()["details"]["age"]["main"] is not None and \
                  self.data()["details"]["age"]["main"] >= 18,
         "is_over_21":
         lambda : self.data()["details"]["age"]["main"] is not None and \
                  self.data()["details"]["age"]["main"] >= 21,
         "is_phone_verified":
         lambda : self.data()["details"]["phone"]["verified"]["main"],
         "is_email_verified":
         lambda : self.data()["email"]["verified"]["main"],
         "is_age_verified":
         lambda : self.data()["details"]["age"]["verified"]["main"],
         "is_first_name_verified":
         lambda : self.data()["details"]["first_name"]["verified"]["main"],
         "is_last_name_verified":
         lambda : self.data()["details"]["last_name"]["verified"]["main"]
        }
        self.model = {
            "username": {
                "main" : None,
                "last_update": None
            },
            "email": {
                "main" : None,
                "public": False,
                "verified": {
                    "main": False,
                    "check_key": {
                        "main": None,
                        "until": None,
                        "try": {
                            "count": 0,
                            "last": None,
                        },
                    },
                    "last_update": None
                 },
                "last_update": None
            },
            "password": {
                "main" : {
                    "by_usr": None,
                    "by_mail": None
                },
                "reset_key": {
                    "main": None,
                    "until": None,
                    "try": {
                        "count": 0,
                        "last": None,
                    },
                    "last_update": None
                },
                "last_update": None
            },
            "roles": {},
            "details": {
                "phone": {
                    "main" : None,
                    "public": False,
                    "verified": {
                        "main": False,
                        "check_key": {
                            "main": None,
                            "until": None,
                            "try": {
                                "count": 0,
                                "last": None,
                            },
                        },
                        "last_update": None
                     },
                    "last_update": None
                },
                "first_name": {
                    "main" : None,
                    "public": False,
                    "verified": {
                        "main": False,
                        "using": [],
                        "last_update": None
                    },
                    "last_update": None
                },
                "last_name": {
                    "main" : None,
                    "public": False,
                    "verified": {
                        "main": False,
                        "using": [],
                        "last_update": None
                    },
                    "last_update": None
                },
                "age": {
                    "main": None,
                    "public": False,
                    "verified": {
                        "main": False,
                        "using": [],
                        "last_update": None
                    },
                    "last_update": None
                },
                "nationality": {},
                "address": {
                    "main" : [],
                    "others": {}
                },
                "payments": {
                    "cards": {
                        "main" : [],
                        "others": {}
                    }
                },
            },
            "last_update": None,
            "signup": None,
        }

    def get_askable(self):
        return [True, {"askable": list(self.askable.keys())}, None]

    def check_asked(self, asked):
        if not isinstance(asked, list) or not all(isinstance(term, str) for term in asked):
            return [False, "invalid format", 400]
        askable = self.askable.keys()
        for term in askable:
            if term not in askable:
                return [False, f"Invalid term {term}", 400]
        return [True, {}, None]

    def data(self, update = False):
        if (self.d is None or update is True) and self.id != "-1":
            self.d = self.red.get(self.id).run()
            if self.d != None:
                self.d = dict(self.d)
        return self.d

    def wait_token(self, key, secret):
        return [True, {}, None]

    def get_token(self, id = None, registry = "", delta = 48, asked = []):
        if (not isinstance(id, str) and id is not None) or not isinstance(registry, str) or \
           not isinstance(delta, int) or not isinstance(asked, list) or \
           not all(isinstance(a, str) for a in asked):
           return [False, "Invalid param", 400]
        id = self.__getid(id, self.id)
        if id == "-1":
            return [False, "Invalid id", 403]
        private_key = open(f'{secret_path}jwt-key').read()
        payload = {}
        if len(asked) == 0:
            payload["id"] = id
        else:
            data = dict(self.red.get(id).run())
            possible = self.askable
            if not all(a in possible for a in asked):
                return [False, "Invalid information asked", 401]
            for i in asked:
                if possible[i]() is None:
                    return [False, f"Information not completed: {i}", 403]
                payload[i] = possible[i]()
        now = datetime.datetime.utcnow()
        exp = now + datetime.timedelta(hours=delta)
        issuer = "auth:back"
        audience = ["auth:back"] if len(registry) == 0 else f"auth:{registry}"
        token = jwt.encode({
            'iat': now,
            'exp': exp,
            'nbf': now,
            'iss': issuer,
            'aud': audience,
            'payload': payload,
        }, private_key, algorithm='RS256')
        ret = [True, {'exp': str(exp), "usrtoken": token}, None, ]
        if registry == "":
            ret.append({"usrtoken": str(token)})
        return ret

    def verify(self, token, reenable = False):
        if not isinstance(token, str):
            return [False, "Invalid param type"]
        public_key = open(f'{secret_path}jwt-key.pub').read()
        try:
            payload = jwt.decode(
                token,
                public_key,
                leeway=0,
                issuer="auth:back",
                audience="auth:back",
                algorithms=['RS256']
            )
            id = str(payload["payload"]["id"])
            if id == "-1":
                return [False, "User not logged", 401]
            self.id = id
        except jwt.ExpiredSignatureError:
            return [False, "Signature expired", 403]
        except jwt.InvalidSignatureError:
            return  [False, "Invalid signature", 400]
        except jwt.InvalidIssuedAtError:
            return [False, "Invalid time", 400]
        except jwt.InvalidIssuerError:
            return [False, "Invalid issuer", 403]
        except jwt.InvalidAudienceError:
            return [False, "Invalid audience", 401]
        except jwt.ImmatureSignatureError:
            return [False, "Invalid time", 400]
        except jwt.DecodeError:
            return [False, "Invalid jwt", 400]
        if self.data() is None:
            return [False, "User does not exist", 400]
        if "disabled" in self.roles()[1] \
           and self.roles()[1]["disabled"]["active"] is True:
            if reenable != True:
                return [False, "User is disabled", 400]
            email = self.data()["email"]["main"]
            self.set_role(self.id, "disabled", False)
        return [True, {"usr_id": id}, None]

    def invite(self, email):
        email = str(email)
        username = email.split('@')[0]
        ret = [True, {}, None]
        date = str(datetime.datetime.utcnow())
        if self.__exist(email):
            return ret
        data = {
            "username": {
                "main" : username,
                "last_update": None
            },
            "email": {
                "main" : email,
                "public": False,
                "verified": {
                    "main": False,
                    "check_key": {
                        "main": None,
                        "until": None,
                        "try": {
                            "count": 0,
                            "last": None,
                        },
                    },
                    "last_update": None
                 },
                "last_update": None
            },
            "roles": {},
            "last_update": None,
        }
        res = dict(self.red.insert([data]).run())
        id = res["generated_keys"][0]
        self.set_role(id, "invite")
        return ret

    def search_user(self, query, page = 0, bypage = 10, admin = False, invite = False):
        page = int(page)
        bypage = int(bypage)
        page = (page if page > 0 else 0)
        bypage = (bypage if bypage > 5 else 5)
        start = page * bypage
        end = (page + 1) * bypage
        query = query if len(str(query)) > 0 else None
        if invite is False:
            ret = self.red.filter(~r.row.has_fields({"roles": "invite"}))
        if query is not None:
            ret = ret.filter(
                lambda doc:
                    (
                        doc['username']['main'].match(f"(?i){query}")
                        or
                        (
                            doc['email']['main'].match(f"(?i){query}")
                            and
                            (admin is True or doc['email']['public'] is True)
                        )
                        or
                        (
                            doc['details']['first_name']['main'].match(f"(?i){query}")
                            and
                            (admin is True or doc['details']['first_name']['public'] is True)
                        )
                        or
                        (
                            doc['details']['last_name']['main'].match(f"(?i){query}")
                            and
                            (admin is True or doc['details']['last_name']['public'] is True)
                        )
                    )
            )
        ret = list(ret.map(lambda res : res['id']).slice(start, end).run())
        return [True, {"users": ret}, None]


    def register(self, email, pass1, pass2, role = "user"):
        id = None
        date = str(datetime.datetime.utcnow())
        if not all(isinstance(i, str) for i in [email, pass1, pass2, role]):
            return [False, "Invalid param type", 400]
        if not self.__email(email):
            return [False, "Invalid email", 400]
        if self.__exist(email):
            id = user(email=email).id
            if "invite" not in user(id).roles()[1]:
                return [False, "Email already in use", 400]
        if pass1 != pass2:
            return [False, "Passwords do not match", 400]
        if not self.__strong_pass(pass1):
            return [False, "Password too weak", 400]
        if len(email) > 60:
            return [False, "Email too long", 401]
        if role not in self.av_roles:
            return [False, f"Invalid role: {role}"]
        username = email.split('@')[0]
        while (len(list(self.red.filter(r.row["username"]["main"] == username).run())) > 0):
            username = email.split('@')[0] + str(random.randint(0, 999)).rjust(3, '0')
        password_email = self.__hash(email, pass1)
        password_username = self.__hash(username, pass1)
        data = self.model
        data["signup"] = date
        data["email"]["main"] = email
        data["username"]["main"] = username
        data["password"]["main"]["by_usr"] = password_username
        data["password"]["main"]["by_mail"] = password_email
        if id is not None:
            data["id"] = id
            self.red.get(id).delete().run()
        creator = False
        if self.red.is_empty().run():
            creator = True
        res = dict(self.red.insert([data]).run())
        self.id = res["generated_keys"][0] if id is None else id
        if creator is True:
            self.set_role(self.id, "creator")
        self.set_role(self.id, role)
        return [True, {"usr_id": self.id}, None]

    def login(self, login, password):
        if not all(isinstance(i, str) for i in [login, password]):
            return [False, "Invalid param type", 400]
        password = self.__hash(login, password)
        res = list(self.red.filter(
            ((r.row["email"]["main"] == login)
            & (r.row["password"]["main"]["by_mail"] == password))
            |
            ((r.row["username"]["main"] == login)
            & (r.row["password"]["main"]["by_usr"] == password))
        ).run())
        if len(res) == 0:
            return [False, "Invalid email or password", 403]
        self.id = res[0]["id"]
        if "disabled" in self.roles()[1] \
           and self.roles()[1]["disabled"]["active"] is True:
            if reenable != True:
                return [False, "User is disabled", 400]
            email = self.data()["email"]["main"]
            self.set_role(self.id, "disabled", False)
        return [True, {"usr_id": self.id}, None]


    def delete(self, all = False):
        ret =  {"usr_id": self.id}
        if self.id == '-1':
            return [False, "User not logged", 401]
        if all:
            if not dict(self.red.get(self.id).delete().run())["skipped"] == 0:
                return [False, "error", 500]
            ret["deleted"] = True
        else:
            self.set_role(self.id, "disabled", True)
        return [True, ret, None]

    def updetails(self, phone = {}, fname = {}, lname = {}, username = None, email = {}, account_lang = []):
        up = {}
        date = str(datetime.datetime.utcnow())

        if isinstance(username, str):
            if not len(username) < 30 or not len(username) > 5:
                 return [False, f"Username must contain more 5 and than less than 30 characters", 400 ]
            if self.__username_exist(username):
                return [False, f"Username: {username} aleardy used", 400 ]
            self.red.get(self.id).update(
                {
                    "username": {
                        "main": username,
                        "last_update": date
                    },
                    "last_update": date
                }
            ).run()

        if isinstance(email, dict) and "public" in email:
            public = self.data()['email']['public']
            if isinstance(email['public'], bool):
                public = email['public']
                self.red.get(self.id).update(
                    {
                        "email": {
                            "public": public,
                            "last_update": date
                        },
                        "last_update": date
                    }
                ).run()

        if isinstance(phone, dict) and "lang" in phone and "number" in phone and \
            isinstance(phone["lang"], str) and isinstance(phone["number"], str) and \
            len(phone["number"]) >= 10:
            try:
                phone["number"] = phonenumbers.format_number(phonenumbers.parse(str(phone["number"]), str(phone["lang"])),
                                                   phonenumbers.PhoneNumberFormat.INTERNATIONAL)
            except phonenumbers.phonenumberutil.NumberParseException:
                phone["number"] = None
            if phone["number"] is not None:
                phone["number"] = phone["number"].replace(" ", "")
                up["phone"] = {}
                up["phone"]["main"] = { "number": phone["number"], "lang": phone["lang"] }
                up["phone"]["last_update"] = date
                if up["phone"]["main"] != self.data()["details"]["phone"]["main"]:
                    up["phone"]["verified"] =  {
                        "main": False,
                        "check_key": {
                            "main": None,
                            "until": None,
                            "try": {
                                "count": 0,
                                "last": None,
                            },
                        },
                        "last_update": date
                    }
                up["phone"]["last_update"] = date
                if "public" in phone and isinstance(phone["public"], bool):
                    up["phone"]["public"] = phone["public"]
                self.red.get(self.id).update(
                    {
                        "details": {
                            "phone": up["phone"]
                        },
                        "last_update": date
                    }
                ).run()
                if "verified" in up['phone']:
                    up["phone"]["verified"] = False


        if  isinstance(fname, dict) and "first_name" in fname and \
            isinstance(fname["first_name"], str):
            up["first_name"] = {}
            up["first_name"]["main"] = fname["first_name"]
            up["first_name"]["last_update"] = date
            if "public" in fname and isinstance(fname["public"], bool):
                up["first_name"]["public"] = fname["public"]
            if up["first_name"]["main"] != self.data()["details"]["first_name"]["main"]:
                up["first_name"]["verified"] = {
                    "main": False,
                    "using": [],
                    "last_update": None
                }
            self.red.get(self.id).update(
                {
                    "details": {
                        "first_name": up["first_name"]
                    },
                    "last_update": date
                }
            ).run()
            if "verified" in up['first_name']:
                up["first_name"]["verified"] = False


        if  isinstance(lname, dict) and "last_name" in lname and \
            isinstance(lname["last_name"], str):
            up["last_name"] = {}
            up["last_name"]["main"] = lname["last_name"]
            up["last_name"]["last_update"] = date
            if "public" in lname and isinstance(lname["public"], bool):
                up["last_name"]["public"] = lname["public"]
            if up["last_name"]["main"] != self.data()["details"]["last_name"]["main"]:
                up["last_name"]["verified"] = {
                    "main": False,
                    "using": [],
                    "last_update": None
                }
            self.red.get(self.id).update(
                {
                    "details": {
                        "last_name": up["last_name"],
                        "verified": {
                            "main": False,
                            "using": [],
                            "last_update": None
                        }
                    },
                    "last_update": date
                }
            ).run()
            if "verified" in up['last_name']:
                up["last_name"]["verified"] = False

        return [True, up, None]

    def has_role(self, role):
        ret = {}
        try:
            if role in list(self.data()["roles"].keys()):
                return [True, {}, None]
        except:
            return [False, "User not logged", 401]
        return [False, f"User is not {role}", 401]

    def roles(self):
        ret = {}
        try:
            ret = self.data()["roles"]
        except:
            return [False, "User not logged", 401]
        return [True, ret, None]

    def get_infos(self, extended = False, id = None):
        if not isinstance(extended, bool):
            return [False, "Invalid param type", 400]
        id = self.__getid(id, self.id)
        res = self.data()
        if res is None:
            return [False, f"User {id} does not exist", 401]
        ret = {
            "username": res["username"]["main"] if "username" in res and "main" in res["username"] else None,
            "email": res["email"]["main"] if res["email"]["public"] or id == self.id else None,
            "roles": res["roles"]
        }
        if id != self.id:
            to_delete = []
            for i in ret["roles"]:
                if not ret["roles"][i]["active"]:
                    to_delete.append(i)
                else:
                    del ret["roles"][i]["by"]
            for i in to_delete:
                del ret["roles"][i]
        if extended:
            for i in res["details"]:
                if "public" in res["details"][i] and (res["details"][i]["public"] is True or id == self.id):
                   ret[i] = {
                       "main": res["details"][i]["main"]
                   }
                   if id == self.id:
                       ret[i]["last_update"] = res["details"][i]["last_update"]
                       ret[i]["public"] =  res["details"][i]["public"]
            vscore = res["email"]["verified"]["main"] + \
                     res["details"]["phone"]["verified"]["main"]
            iscore = res["details"]["first_name"]["verified"]["main"] + \
                     res["details"]["last_name"]["verified"]["main"] + \
                     res["details"]["age"]["verified"]["main"]
            ret["verified"] = {}
            if id == self.id:
                ret["email"] = {
                    "main": res["email"]["main"],
                    "last_update": res["email"]["last_update"],
                    "public": res["email"]["public"]
                }
                ret["verified"]["contact"] = {
                    "score":  vscore,
                    "data": {
                        "email": {
                            "main": res["email"]["verified"]["main"],
                            "last_update": res["email"]["verified"]["last_update"]
                        },
                        "phone": {
                            "main": res["details"]["phone"]["verified"]["main"],
                            "last_update": res["details"]["phone"]["verified"]["last_update"],
                        }
                    }
                }
                ret["verified"]["identity"] = {
                    "score": iscore,
                    "data": {
                        "first_name": {
                            "main": res["details"]["first_name"]["verified"]["main"],
                            "last_update": res["details"]["first_name"]["verified"]["last_update"]
                        },
                        "last_name": {
                            "main": res["details"]["last_name"]["verified"]["main"],
                            "last_update": res["details"]["last_name"]["verified"]["last_update"]
                        },
                        "age": {
                            "main": res["details"]["age"]["verified"]["main"],
                            "last_update": res["details"]["age"]["verified"]["last_update"]
                        },
                    }
                }
            else:
                ret["verified"]["contact"] = False if vscore < 1 else True
                ret["verified"]["identity"] = False if iscore < 3 else True
        return [True, ret, None]

    def set_role(self, id, role, active = True):
        if not isinstance(role, str):
            return False
        if not isinstance(active, bool):
            return False
        role = str(role)
        ret = False
        if role not in self.av_roles:
            return False
        date = str(datetime.datetime.utcnow())
        roles = self.data()
        if roles is None:
            roles = {}
        else:
            roles = roles["roles"]
        if role not in roles:
            ret = dict(self.red.get(id).update({
                "roles": {
                    role: {
                        "active": active,
                        "last_update": date,
                        "by": None if self.id == id else self.id,
                    }
                },
                "last_update": date
            }).run())
            ret = ret["skipped"] == 0
        else:
            ret = dict(self.red.get(id).update({
                "roles": {
                    role: {
                        "active": active,
                        "last_update": date,
                        "by": None if self.id == id else self.id
                    }
                },
                "last_update": date
            }).run())
            ret = ret["skipped"] == 0
        return ret

    def check_email(self):
        u = self.data()
        if u["email"]["verified"]["main"] == True:
            return [False, "already verified", 401]
        key = self.__random_key(6)
        if self.id == '-1':
            return [True, {"key": key}, None]
        date = str(datetime.datetime.utcnow())
        until = str(datetime.datetime.utcnow() + datetime.timedelta(hours=24))
        k = self.__hash(self.id, key)
        self.red.get(self.id).update({
            "email": {
                "verified": {
                    "main": False,
                    "check_key": {
                        "main": k,
                        "until": until,
                        "try": {
                            "count": 0,
                            "last": date,
                        },
                    },
                    "last_update": None
                 },
                "last_update": date
            },
            "last_update": date
        }).run()
        return [True, {"key": key, "time": ["heures", 24]}, None]

    def verify_email_key(self, key):
        if self.id == '-1':
            return [False, "User not logged", 401]
        u = self.data()
        k = u["email"]["verified"]["check_key"]
        if k["main"] == None:
            return [False, "Invalid key", 401]
        count = k["try"]["count"]
        until = datetime.datetime.strptime(k["until"], '%Y-%m-%d %H:%M:%S.%f')
        last = datetime.datetime.strptime(k["try"]["last"], '%Y-%m-%d %H:%M:%S.%f')
        delta = self.scale_verify_email["scale"][count if count < len(self.scale_verify_email["scale"]) else len(self.scale_verify_email["scale"]) - 1]
        next = last + datetime.timedelta(minutes=delta)
        now = datetime.datetime.utcnow()
        date = str(now)
        if self.scale_verify_email["limit"] == True and count > len(self.scale_verify_email["scale"]) - 1:
            return [False, "Too many tries", 401]
        if now < next:
             return [False, f"next retry: {next}", 401]
        count += 1
        self.red.get(self.id).update({
            "email": {
                "verified": {
                    "check_key": {
                        "try": {
                            "count": count,
                            "last": date,
                        },
                    },
                    "last_update": date
                },
                "last_update": date
            },
            "last_update": date
        }).run()
        if k["main"] != self.__hash(self.id, key) or k["main"] is None or k["until"] is None:
            return [False, f"Invalid key", 401]
        if until < now:
            return [False, f"key expired", 401]
        self.red.get(self.id).update({
            "email": {
                "verified": {
                    "main": True,
                    "check_key": {
                        "main": None,
                        "until": None,
                        "try": {
                            "count": 0,
                            "last": None,
                        },
                    },
                    "last_update": date
                },
                "last_update": date
            },
        "last_update": date
        }).run()
        return [True, {}, None]

    def check_phone(self):
        u = self.data()
        if u["details"]["phone"]["verified"]["main"] == True:
            return [False, "already verified", 401]
        key = self.__random_key(6)
        if self.id == '-1':
            return [True, {"key": key}, None]
        date = str(datetime.datetime.utcnow())
        until = str(datetime.datetime.utcnow() + datetime.timedelta(minutes=10))
        k = self.__hash(self.id, key)
        self.red.get(self.id).update({
            "details": {
                "phone": {
                    "verified": {
                        "main": False,
                        "check_key": {
                            "main": k,
                            "until": until,
                            "try": {
                                "count": 0,
                                "last": date,
                            },
                        },
                        "last_update": None
                     },
                    "last_update": date
                },
            },
            "last_update": date
        }).run()
        return [True, {"key": key, "time": ["minutes", 10]}, None]

    def verify_phone_key(self, key):
        if not isinstance(key, str):
            return [False, "Invalid param type", 400]
        if self.id == '-1':
            return [False, "User not logged", 401]
        u = self.data()
        k = u["details"]["phone"]["verified"]["check_key"]
        if k["main"] == None:
            return [False, "Invalid key", 401]
        count = k["try"]["count"]
        until = datetime.datetime.strptime(k["until"], '%Y-%m-%d %H:%M:%S.%f')
        last = datetime.datetime.strptime(k["try"]["last"], '%Y-%m-%d %H:%M:%S.%f')
        delta = self.scale_verify_phone["scale"][count if count < len(self.scale_verify_phone["scale"]) else len(self.scale_verify_phone["scale"]) - 1]
        next = last + datetime.timedelta(minutes=delta)
        now = datetime.datetime.utcnow()
        date = str(now)
        if self.scale_verify_phone["limit"] == True and count > len(self.scale_verify_phone["scale"]) - 1:
            return [False, "Too many tries", 401]
        if now < next:
             return [False, f"next retry: {next}", 401]
        count += 1
        self.red.get(self.id).update({
            "details": {
                "phone": {
                    "verified": {
                        "check_key": {
                            "try": {
                                "count": count,
                                "last": date,
                            },
                        },
                        "last_update": date
                    },
                    "last_update": date
                }
            },
            "last_update": date
        }).run()
        if k["main"] != self.__hash(self.id, key) or k["main"] is None or k["until"] is None:
            return [False, f"Invalid key", 401]
        if until < now:
            return [False, f"key expired", 401]
        self.red.get(self.id).update({
            "details": {
                "phone": {
                    "verified": {
                        "main": True,
                        "check_key": {
                            "main": None,
                            "until": None,
                            "try": {
                                "count": 0,
                                "last": None,
                            },
                        },
                        "last_update": date
                    },
                    "last_update": date
                }
            },
        "last_update": date
        }).run()
        return [True, {}, None]

    def reset_key(self):
        key = self.__random_key(5)
        if self.id == '-1':
            return [False, "INVALID EMAIL TEMP ERROR MESSAGE", 404] #####TEMP !!!
        date = str(datetime.datetime.utcnow())
        until = str(datetime.datetime.utcnow() + datetime.timedelta(hours=2))
        k = self.__hash(self.id, key)
        self.red.get(self.id).update({
            "password": {
                "reset_key": {
                    "main": k,
                    "until": until,
                    "try": {
                        "count": 0,
                        "last": date,
                    },
                    "last_update": date
                },
                "last_update": date
            },
        "last_update": date
        }).run()
        return [True, {"key": key, "time": ["heures", 2]}, None]

    def verify_reset_key(self, key, password):
        if not isinstance(key, str) or not isinstance(password, str):
            return [False, "Invalid param type"]
        if self.id == '-1':
            return [False, "Invalid email / key", 401]
        u = self.data()
        k = u["password"]["reset_key"]
        if k["main"] == None:
            return [False, "Invalid email / key", 401]
        count = k["try"]["count"]
        until = datetime.datetime.strptime(k["until"], '%Y-%m-%d %H:%M:%S.%f')
        last = datetime.datetime.strptime(k["try"]["last"], '%Y-%m-%d %H:%M:%S.%f')
        delta = self.scale_change_pass["scale"][count if count < len(self.scale_change_pass["scale"]) else len(self.scale_change_pass["scale"]) - 1]
        next = last + datetime.timedelta(minutes=delta)
        now = datetime.datetime.utcnow()
        date = str(now)
        if self.scale_change_pass["limit"] == True and count > len(self.scale_change_pass["scale"]) - 1:
            return [False, "Too many tries", 401]
        if now < next:
             return [False, f"next retry: {next}", 401]
        count += 1
        self.red.get(self.id).update({
            "password": {
                "reset_key": {
                    "try": {
                        "count": count,
                        "last": date,
                    },
                    "last_update": date
                },
                "last_update": date
            },
            "last_update": date
        }).run()
        if k["main"] != self.__hash(self.id, key) or k["main"] is None or k["until"] is None:
            return [False, "Invalid key", 401]
        if until < now:
            return [False, "key expired", 401]
        password_email = self.__hash(u["email"]["main"], password)
        password_username = self.__hash(u["username"]["main"], password)
        self.red.get(self.id).update({
            "password": {
                "main" : {
                    "by_usr": password_username,
                    "by_mail": password_email
                },
                "reset_key": {
                    "main": None,
                    "until": None,
                    "try": {
                        "count": 0,
                        "last": None,
                    },
                    "last_update": None
                },
                "last_update": date
            },
        "last_update": date
        }).run()
        return [True, {}, None]

    def __random_key(self, length = 6):
        data = string.ascii_uppercase + string.digits
        key = ''.join(random.choice(data) for i in range(length))
        return key

    def __hash(self, uniq, data):
        if data is None or uniq is None:
            return None
        s = len(uniq)
        n = s % (len(data) - 1 if len(data) > 1 else 1)
        secret = "damn"
        salted = data[:n] + str(s) + secret + data[n:]
        hashed = hashlib.sha512(salted.encode('utf-8')).hexdigest()
        return hashed

    def __exist(self, email):
        res = list(self.red.filter(r.row["email"]["main"] == email).run())
        if len(res) > 0:
            return True
        return False

    def __username_exist(self, username):
        res = list(self.red.filter(r.row["username"]["main"] == username).run())
        if len(res) > 0:
            return True
        return False

    def __getid(self, id, idbis = None):
        return id if id != "-1" and id is not None else idbis if idbis is not None else self.id

    def __email(self, email):
        reg = "[^@]+@[^@]+\.[^@]+"
        return re.match(reg, email)

    def __strong_pass(self, password):
        reg = "(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8}"
        return re.match(reg, password)



def test():
    logging.warning("-")
    logging.warning("Starting user's test")
    u = user()
    u2 = user()

    email = "eliot1@test.fr"
    email2 = "test1@test.fr"
    password = "T2*eeeee"
    phone = "0626232886"
    prenom = "eliot"
    nom = "courtel"
    user(None, email).delete(True)
    user(None, email2).delete(True)
    u.register(email, password, password)
    u.login(email, password)
    key = u.get_key()
    key = u.get_key()
    key = u.get_key()
    key = u.get_key()
    key = key[1]["key"] if isinstance(key[1], dict) else None
    sec = key[1]["secret"] if isinstance(key[1], dict) else None
    u.get_token(registeries=["test"], key=key)
    u.wait_token(key, sec)
    token = u.get_token()
    token = token[1]["usrtoken"] if isinstance(token[1], dict) else None
    u.verify(token)
    key = u.reset_key()
    del u
    u = user(None, email)
    key = key[1]["key"] if isinstance(key[1], dict) else None
    u.verify_reset_key(key, password + "e")
    u.login(email, password + "e")
    u.updetails({"number": phone, "lang": 'FR'}, {"first_name": prenom}, {"last_name": nom, "public": True})
    key = u.check_email()
    key = key[1]["key"] if isinstance(key[1], dict) else None
    u.verify_email_key(key)
    key = u.check_phone()
    key = key[1]["key"] if isinstance(key[1], dict) else None
    u.verify_phone_key(key)
    u.invite(email2)
    u2.register(email2, password, password)
    u2.login(email2, password)
    u2.get_infos(True, u.id)
    u2.get_infos(True)
    u2.delete(True)
    token = u.get_token()[1]["usrtoken"]
    del u
    u = user()
    u.verify(token)
    u.get_infos(True)
    u.delete()
    u = user(None, email)
    u.delete(True)
    u = user(None, email2)
    u.delete(True)
    logging.warning("Ending user's test")
# try:
#     test()
# except:
#     logging.error("User's test error")
