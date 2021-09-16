from Model.auth import *
from Model.user import *
from Model.registry import *

def setuproute(app, call):
    @app.route('/',                             ['OPTIONS', 'GET'],         lambda x = None: call([origin_check])) #done

    @app.route('/signup',                       ['OPTIONS', 'POST'],        lambda x = None: call([user_register, user_get_token])) #done
    @app.route('/signin',                       ['OPTIONS', 'POST'],        lambda x = None: call([user_login, user_get_token])) #done
    @app.route('/token',                        ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_get_token])) #done

    @app.route('/users',                        ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_search])) #done
    @app.route('/user',                         ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_infos])) #done
    @app.route('/user',                         ['OPTIONS', 'PUT'],         lambda x = None: call([user_verify_token, user_update])) #done
    @app.route('/user',                         ['OPTIONS', 'DELETE'],      lambda x = None: call([user_verify_token, user_disable])) #done
    @app.route('/user/invite',                  ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_invite])) #done
    @app.route('/user/registry',                ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_registries])) #done
    @app.route('/user/<>',                      ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_infos])) #done
    @app.route('/user/<>/role',                 ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_role])) #done

    @app.route('/registry',                    ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_is_admin, regi_create])) #done

    @app.route('/registry/<>',                 ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_get_infos, regi_infos])) #done
    @app.route('/registry/<>',                 ['OPTIONS', 'DELETE'],      lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_delete, regi_delete])) #done

    @app.route('/registry/<>/name',            ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_get_infos, regi_get_name])) #done
    @app.route('/registry/<>/name',            ['OPTIONS', 'PUT'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_edit, regi_set_name])) #done
    @app.route('/registry/<>/open',            ['OPTIONS', 'PUT'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_edit, regi_set_open])) #done

    @app.route('/registry/<>/roles',           ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_get_infos, regi_roles])) #done
    @app.route('/registry/<>/role',            ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_edit, regi_add_role])) #done
    @app.route('/registry/<>/role/<>',         ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_get_infos, regi_role])) #done
    @app.route('/registry/<>/role/<>',         ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_edit, regi_edit_role])) #done
    @app.route('/registry/<>/role/<>',         ['OPTIONS', 'DELETE'],      lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_edit, regi_delete_role])) #done

    @app.route('/registry/<>/actions',         ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_get_infos, regi_actions])) #done
    @app.route('/registry/<>/action',          ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_edit, regi_add_action])) #done
    @app.route('/registry/<>/action/<>',       ['OPTIONS', 'DELETE'],      lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_edit, regi_delete_action])) #done

    @app.route('/registry/<>/invite',          ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_invite, regi_invite])) #done

    @app.route('/registry/<>/keys',            ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_use_api, regi_keys])) #done
    @app.route('/registry/<>/key',             ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_use_api, regi_add_key])) #done
    @app.route('/registry/<>/key/<>',          ['OPTIONS', 'DELETE'],      lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_use_api, regi_delete_key])) #done

    @app.route('/registry/<>/users',           ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_regi, user_regi_exist, regi_can_get_infos, registry_users])) #done

    @app.route('/extern/public',                ['OPTIONS', 'POST'],        lambda x = None: call([regi_check_key, user_publickey])) #done
    @app.route('/extern/askable',               ['OPTIONS', 'POST'],         lambda x = None: call([regi_check_key, user_get_askable])) #for dev only
    @app.route('/extern/key',                   ['OPTIONS', 'POST'],        lambda x = None: call([regi_check_key, user_check_asked, regi_get_signin])) #done
    @app.route('/extern/key/<>/token',          ['OPTIONS', 'POST'],        lambda x = None: call([regi_check_key, regi_wait_token])) #done

    @app.route('/intern/key/<>/infos',          ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, regi_info_signin])) #done
    @app.route('/intern/key/<>/signin',         ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, regi_info_signin, regi_verify_signin, user_get_token, regi_end_signin])) #todo

    @app.route('/user/password/reset',          ['OPTIONS', 'POST'],        lambda x = None: call([user_tmp_spoof, user_password_reset])) #done not imp
    @app.route('/user/password/change',         ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_password_reset])) #done not imp
    @app.route('/user/password/change',         ['OPTIONS', 'POST'],        lambda x = None: call([user_tmp_spoof, user_password_change])) # done not imp

    @app.route('/admin/users',                  ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_is_admin, admin_user_search])) #done
    @app.route('/admin/user/<>',                ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_is_admin, admin_user_infos])) #done
    @app.route('/admin/user/<>/role',           ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token, user_is_admin, user_set_role])) #done
    @app.route('/admin/user/<>/registry',      ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token, user_is_admin, user_registries])) #done

    @app.route('/card',                         ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token]))
    @app.route('/card',                         ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token]))
    @app.route('/card/<>',                      ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token]))
    @app.route('/card/<>',                      ['OPTIONS', 'DELETE'],      lambda x = None: call([user_verify_token]))

    @app.route('/order/',                       ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token]))
    @app.route('/orderdetail/',                 ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token]))
    @app.route('/history/',                     ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token]))
    @app.route('/payments/',                    ['OPTIONS', 'GET'],         lambda x = None: call([user_verify_token]))
    @app.route('/paymentdetails/',              ['OPTIONS', 'POST'],        lambda x = None: call([user_verify_token]))
    def base():
        return
