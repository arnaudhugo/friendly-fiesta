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
from .rethink import get_conn, r

secret_path = "./secret/"

logging.basicConfig(format='%(asctime)s %(message)s', datefmt='[ %m/%d/%Y-%I:%M:%S%p ]')

class user:
    def __init__(self, id = -1):
        if id is None:
            id = -1
        self.id = str(id)
        self.red = get_conn().db("auth").table('users')
  
    def verify(self, token):
        if not isinstance(token, str):
            return [False, "Invalid param type"]
        try:
          public_key = open(f'{secret_path}jwt-key.pub').read()
        except:
          return [False, "Public key isn't defined", 500]
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
            email = str(payload["payload"]["email"])
            if id == "-1":
                return [False, "User not logged", 401]
            self.id = id
            self.email = email
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
        return [True, {"usr_id": id, "email": email}, None]
