from Controller.basic import check
from Object.users import user

def user_verify_token(cn, nextc):
    err = check.contain(cn.hd, ["usrtoken"], "HEAD")
    if not err[0]:
        return cn.toret.add_error(err[1], err[2])
    cn.private["user"] = user()
    err = cn.private["user"].verify(cn.hd["usrtoken"])
    return cn.call_next(nextc, err)
