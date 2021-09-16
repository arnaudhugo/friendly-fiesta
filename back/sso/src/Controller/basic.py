from bottle import request, response
import os, datetime, re
import json as JSON
import jwt

class ret:
    def __init__(self, route = None, params=None, header = None, cookie = None, anon = None) :
        self.data = {
            'queryInfos' : {
                'route': route,
                'params': params,
                'header': header,
                'cookie': cookie
                },
            'status' :  500,
            'error' :   None,
            'data' :    None,
            'succes' :  False,
            'mod' :     None
        }
        self.err = False
        self.anon = anon

    def get(self):
        return self.data

    def ret(self, raw = False):
        self.__anon()
        self.data['mod'] = self.anon
        if self.data['error'] is None :
            self.data['succes'] = True
            self.data['status'] = 200
        return self.data if not raw else self.data['data']

    def __anon(self):
        level = self.__getannon()
        if level == 0 :
            return
        if level == 2 :
            if "queryInfos" in self.data:
                del self.data["queryInfos"]
            return
        forb = ["content-type", "connection", "x-real-ip", "x-forwarded-for",
                "x-forwarded-proto", "x-forwarded-ssl", "x-forwarded-port",
                "user-agent", "accept", "cache-control", "accept-encoding",
                "cookie", "content-length"]
        for i in self.data["queryInfos"]:
            if i is None:
                continue
            for i2 in forb:
                if self.data["queryInfos"][i] is None or i2 not in self.data["queryInfos"][i]:
                    continue
                del self.data["queryInfos"][i][i2]

    def add_error(self, error = None, code = None):
        self.data['error'] = error
        self.data['status'] = code
        self.data['data'] = None
        if code is None:
            self.add_error("Bad code input", 500)
            return 1
        if error is None:
            self.add_error("Bad error input", 500)
            return 1
        self.err = True
        return self.ret()

    def add_data(self, data = None):
        if data is not None:
            self.data['data'] = data
            self.set_code(200)
        return 0

    def set_code(self, code = None):
        self.data['status'] = code
        if code is None:
            self.add_error("Bad code input", 500)
            return 1
        return 0

    def __getannon(self):
        self.anon = self.anon if self.anon is not None else str(os.getenv('API_MOD', 'PROD'))
        return self.__anon_to_lvl(self.anon)

    def __anon_to_lvl(self, anon = 'PROD'):
        mod = {
        "PROD": 2,
        "DEV" : 1,
        "TEST": 0
        }
        if anon in mod:
            return mod[anon]
        return 2

class check:
    def contain(json, array, type = "body"):
        type = type.upper()
        if json is None:
            return [False, "Invalid json received ", 400]
        for i in array:
            if isinstance(i, list):
                if not check.contain_opt(json, i):
                    return [False, "[" + type +"] Missing on of parameters: " + JSON.dumps(i), 400]
                json = check.setnoneopt(json, i)
            elif i not in json:
                return [False, "[" + type +"] Missing parameter : " + i, 400]
            elif json[i] is None:
                return [False, "[" + type +"] Null parameter : " + i, 400]
        return [True, json, 200]

    def contain_opt(json, arr_opt):
        for i in arr_opt:
            if isinstance(i, list):
                if check.contain(json, i):
                    return True
            elif i in json:
                return True
        return False

    def setnoneopt(json, arr_opt):
        for i in arr_opt:
            if i not in json:
                json[i] = None
        return json

    def json(request):
        res = {}
        #try:
        res = request.json
        #except:
        #    pass
        return res

    def head_json(request, cookie = None):
        res = {}
        # try:
        for i in cookie:
            res[i.lower()] = cookie[i]
        for i in request.headers.keys():
            res[i.lower()] = request.headers.raw(i)
        # except:
            # pass
        return res

    def cookies_json(request):
        res = {}
        try:
            cookie = request.headers.raw("Cookie")
            for i in cookie.split(";"):
                i = i.split("=")
                res[i[0].strip()] = i[1]
        except:
            pass
        return res

    def route_json(request):
        res = {}
        dat = request.path[1:].split('/')
        i = 0
        while i < len(dat) - 1:
            res[str(dat[i])] = str(dat[i + 1])
            i += 1
        return res


class callnext:
    def __init__(self, req, resp = None, err = None, anonlvl = None):
        self.pr = check.json(req)
        self.ck = check.cookies_json(req)
        self.hd = check.head_json(req, self.ck)
        self.rt = check.route_json(req)
        self.ws = req.environ.get('wsgi.websocket')
        self.get = dict(req.query.decode())
        for i in self.get:
            s = self.get[i]
            if s == "true":
                 self.get[i] = True
            elif s == "false":
                 self.get[i] = False
        self.private = {}
        self.cookie = {}
        self.toret = ret(req.path, self.pr, self.hd, self.ck, anonlvl)
        self.req = req
        self.resp = resp
        self.err = err
        self.raw = False

    def call(self, nextc, ws = False, raw = False):
        self.raw = raw
        if ws is not True:
            if self.ws is not None:
                self.ws.send("Invalid protocol")
                self.ws.close()
                return self.toret.add_error("Invalid protocol", 400)
        else:
            if self.ws is None:
                return self.toret.add_error("Invalid protocol", 400)
        if self.req.method == 'OPTIONS':
            return {}
        if len(nextc) == 0:
            return self.ret()
        return nextc[0](self, nextc)

    def call_next(self, nextc, err = [True]):
        if not err[0]:
            return self.toret.add_error(err[1], err[2])
        nextc.pop(0)
        if len(nextc) == 0:
            if len(err) >= 4 and err[3] is not None:
                self.__merge_cookie(err[3])
            self.toret.add_data(err[1])
            return self.ret()
        return nextc[0](self, nextc)

    def ret(self):
        if self.resp is not None:
            for cookie in self.cookie:
                self.resp.set_cookie(cookie, self.cookie[cookie], path='/')
            self.resp.content_type = 'application/json'
            return JSON.dumps(self.toret.ret(self.raw))
        return self.toret.ret(self.raw)

    def __merge_cookie(self, cookies):
        self.cookie = merged = {**self.cookie, **cookies}
