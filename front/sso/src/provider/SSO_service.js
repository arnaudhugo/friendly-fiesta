const endpoint = process.env.REACT_APP_ENDPOINT
const user_id = process.env.REACT_USER_ID



let SSO_service = {

    loadHeadersWithoutToken() {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append("Accept", 'application/json');
        return headers;
    },

    loadHeaders(usrtoken) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append("Accept", 'application/json');
        usrtoken && headers.append("usrtoken",usrtoken);
        return headers;
    },

    getToken(){
        return fetch(endpoint + '/token', {
            method: 'GET',
            headers:this.loadHeadersWithoutToken()
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    register(data){
        return fetch(endpoint + '/signup', {
            method: 'POST',
            headers:this.loadHeadersWithoutToken(),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    login(data){
        return fetch(endpoint + '/signin', {
            method: 'POST',
            headers:this.loadHeadersWithoutToken(),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    getUser(usrtoken){
        return fetch(endpoint + '/user?extended=true', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    getAccountInfo(usrtoken){
        return fetch(endpoint + '/user?extended=true', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    updateUser(data,usrtoken){
        return fetch(endpoint + '/user', {
            method: 'PUT',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    deleteAccount(usrtoken){
        return fetch(endpoint + '/user', {
            method: 'DELETE',
            headers:this.loadHeaders(usrtoken),
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    getKeyForChangePwd(usrtoken){
        return fetch(endpoint + '/user/password/change', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    changePassword(data,usrtoken){
        return fetch(endpoint + '/user/password/change', {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    registry_signin(registries,key,data,usrtoken){
        return fetch(endpoint + '/registries/' + registries + '/key/' + key + '/signin', {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    resetRequest(data){
        return fetch(endpoint + '/user/password/reset', {
            method: 'POST',
            headers:this.loadHeadersWithoutToken(),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_created_user_registies(usrtoken){
        return fetch(endpoint + '/user/registry?creator=true', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_user_registry(usrtoken){
        return fetch(endpoint + '/user/registry?creator=false', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    add_user_to_reg(id_reg,data,usrtoken){
        return fetch(endpoint + '/registry/' + id_reg + '/invite', {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    add_registre(data,usrtoken){
        return fetch(endpoint + '/registry', {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_info_registre(id,usrtoken){
        return fetch(endpoint + '/registry/' + id, {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    remove_registre(id,usrtoken){
        return fetch(endpoint + '/registry/' + id, {
            method: 'DELETE',
            headers:this.loadHeaders(usrtoken),
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_registre_name(id,usrtoken){
        return fetch(endpoint + '/registry/' + id + '/name', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_registre_roles(id,usrtoken){
        return fetch(endpoint + '/registry/' + id + '/roles', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    add_registre_role(id,data,usrtoken){
        return fetch(endpoint + '/registry/' + id + '/role', {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    update_registre_role(id,id_role,data,usrtoken){
        return fetch(endpoint + '/registry/' + id + '/role/' + id_role, {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    remove_registre_role(id,id_role,usrtoken){
        return fetch(endpoint + '/registry/' + id + '/role/' + id_role, {
            method: 'DELETE',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_registre_actions(id,usrtoken){
        return fetch(endpoint + '/registry/' + id + '/actions', {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    add_registre_action(id,data,usrtoken){
        return fetch(endpoint + '/registry/' + id + '/action', {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    remove_registre_action(id,id_action,usrtoken){
        return fetch(endpoint + '/registry/' + id + '/action/' + id_action, {
            method: 'DELETE',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    update_registre_name(id,data,usrtoken){
        return fetch(endpoint + '/registry/' + id + '/name', {
            method: 'PUT',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    update_registre_state(id,data,usrtoken){
        return fetch(endpoint + '/registry/' + id + '/open', {
            method: 'PUT',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    getInfoRole(id_reg,role,usrtoken){
        return fetch(endpoint + '/registry/' + id_reg + '/role/' + role , {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },


    getRegistryUsers(id_reg,usrtoken){
        return fetch(endpoint + '/registry/' + id_reg + '/users' , {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    admin_users_search(query,usrtoken){
        return fetch(endpoint + '/admin/users?q=' + query , {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_admin_user_registries(user_id,usrtoken){
        return fetch(endpoint + '/admin/user/' + user_id + '/registry' , {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    getAdminUserInfo(user_id,usrtoken){
        return fetch(endpoint + '/admin/user/' + user_id , {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    getUserInfo(user_id,usrtoken){
        return fetch(endpoint + '/user/' + user_id , {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    getRegistryKeys(id_reg,usrtoken){
        return fetch(endpoint + '/registry/' + id_reg + '/keys' , {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    addRegistryKey(id_reg,data,usrtoken){
        console.log(data)
        return fetch(endpoint + '/registry/' + id_reg + '/key' , {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    remove_registry_key(id_reg,key,usrtoken){
        return fetch(endpoint + '/registry/' + id_reg + '/key/' + key, {
            method: 'DELETE',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    get_askable(usrtoken){
        return fetch(endpoint + '/extern/askable' , {
            method: 'GET',
            headers:this.loadHeaders(usrtoken)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },


    get_extern_info_key(usrtoken,key,data){
        return fetch(endpoint + '/intern/key/'+key+'/infos' , {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    },

    extern_signin(usrtoken,key,data){
        return fetch(endpoint + '/intern/key/'+key+'/signin' , {
            method: 'POST',
            headers:this.loadHeaders(usrtoken),
            body:JSON.stringify(data)
        }).then(response => response.json()).catch(error => {
            console.log(error);
        });
    }





};

export default SSO_service;
