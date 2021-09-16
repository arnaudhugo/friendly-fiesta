from Model.user import *

def setuproute(app, call):
    @app.route('/',                             ['OPTIONS', 'GET'],         lambda x = None: call([]))
    @app.route('/user/me',                      ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token]))
   
    def base():
        return
