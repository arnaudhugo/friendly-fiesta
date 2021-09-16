import React, {Component} from "react";
import MuiBackdrop from "../../../components/Loading/MuiBackdrop";
import { Progress } from 'semantic-ui-react'
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import '../login_signup.css'
import SSO_service from "../../../provider/SSO_service";
import Extern_signup from "./extern_signup";
import { withSnackbar } from 'notistack';
import moment from "moment";





class extern_login extends Component {



    state = {
        loading:false,
        show_pwd:false,

        login_form:{
            email:localStorage.getItem("email") || "",
            pwd:""
        }
    };

    verifSession(){
        return !(localStorage.getItem("usrtoken") === null || localStorage.getItem("usrtoken") === undefined || moment(localStorage.getItem("exp")) < moment());
    }


    componentDidMount() {
        if(this.verifSession() === true){
            this.props.history.push("/sso/extern/"+this.props.match.params.key+ "/" + this.props.match.params.auth + "/accept")
        }
    }

    handleObjectChange = (object,name) => event => {
        let obj = this.state[object];
        obj[name] = event.target.value;
        this.setState({
            [object]: obj
        });
    };

    login(){
        this.setState({loading:true})

        setTimeout(() => {
            SSO_service.login({login:this.state.login_form.email,password:this.state.login_form.pwd}).then(loginRes => {
                console.log(loginRes)
                if(loginRes.status === 200 && loginRes.succes === true){

                    SSO_service.getUser(loginRes.data.usrtoken).then(infoRes => {
                        console.log(infoRes)
                        if(infoRes.status === 200 && infoRes.succes === true){
                            localStorage.setItem("email",this.state.login_form.email)
                            localStorage.setItem("firstname",infoRes.data.first_name.main || "")
                            localStorage.setItem("lastname",infoRes.data.last_name.main || "")
                            localStorage.setItem("usrtoken",loginRes.data.usrtoken)
                            localStorage.setItem("exp",loginRes.data.exp)

                            let roles_object = infoRes.data.roles || {}
                            const roles_array = [];
                            Object.keys(roles_object).forEach(key => roles_array.push({
                                role: key,
                                data: roles_object[key]
                            }));
                            localStorage.setItem("roles",JSON.stringify(roles_array))
                            this.setState({loading:false})
                            this.props.history.push("/sso/extern/"+this.props.match.params.key+ "/" + this.props.match.params.auth + "/accept")
                        }else{
                            this.props.enqueueSnackbar('Une erreur est survenue lors de la récuperation de vos informations !', { variant:"error" })
                            this.setState({loading:false})
                        }
                    }).catch(err => {
                        console.log(err)
                        this.props.enqueueSnackbar('Une erreur est survenue lors de la récuperation de vos informations !', { variant:"error" })
                        this.setState({loading:false})
                    })
                }else{
                    this.setState({loading:false})
                    this.props.enqueueSnackbar(loginRes.error,{variant:"error"})

                }
            }).catch( err => {
                console.log(err)
                this.props.enqueueSnackbar("Une erreur est survenue !",{variant:"error"})
                this.setState({loading:false})
            })
        },2000)

    }


    render() {

        return (
            <>
                <MuiBackdrop open={this.state.loading}  />
                <div className="container container-lg" style={{marginTop:120}}>

                    <div className="login_form">
                        {
                            this.state.loading === true ?
                                <LinearProgress /> :
                                <Progress active={false} percent={100} size="medium" className="custom-progress-height" color='blue' />
                        }

                        <div>
                            <div className="padding-form">

                                {/*<h5 style={{fontSize:"1.03rem",marginBottom:5,color:"grey"}}>Un service externe souhaite avoir accès à votre compte</h5>*/}
                                <h4 style={{fontSize:"1.4rem",marginBottom:5,marginTop:10}}>Connexion</h4>
                                <h6>Accéder à votre compte</h6>

                                <form id="login-form" style={{maxWidth:500,alignSelf:"center"}}
                                      onSubmit={(e) => {
                                          e.preventDefault(); e.stopPropagation();
                                          this.login()
                                      }}
                                >
                                    <div className="row mt-4">
                                        <div className="col-md-12 mt-2">
                                            <TextField
                                                label="Email"
                                                variant="outlined"
                                                size="small"
                                                style={{width:"100%"}}
                                                required={true}
                                                inputProps={{pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,8}$",title:"Veuillez saisir une adresse mail valide !" }}
                                                value={this.state.login_form.email}
                                                onChange={this.handleObjectChange('login_form','email')}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-md-12 mt-2">
                                            <TextField
                                                label="Mot de passe"
                                                type={this.state.show_pwd === true ? "text" : "password"}
                                                variant="outlined"
                                                size="small"
                                                style={{width:"100%"}}
                                                required={true}
                                                value={this.state.login_form.pwd}
                                                onChange={this.handleObjectChange('login_form','pwd')}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mt-1">
                                        <div className="col-md-12">
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={this.state.show_pwd === true}
                                                        onChange={() => {this.setState({show_pwd:!this.state.show_pwd})}}
                                                        color="primary"
                                                    />
                                                }
                                                label="Afficher le mot de passe"
                                            />
                                        </div>
                                    </div>
                                    <div className="row mt-4">
                                        <div className="col-md-12">
                                            <div style={{display:"flex"}}>
                                                <Button color="primary" style={{textTransform:"none"}}
                                                        onClick={() =>
                                                            this.props.history.push("/sso/extern/"+this.props.match.params.key+ "/" + this.props.match.params.auth + "/signup")}>Créer un compte</Button>
                                                <Button type="submit" variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary">Se connecter</Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div align="center" style={{marginTop:25}}>
                                        <Button color="primary" style={{textTransform:"none"}}
                                                onClick={() => {
                                                    //this.props.history.push("/sso/reset")
                                                }}>Mot de passe oublié ?</Button>
                                    </div>

                                </form>
                            </div>
                        </div>

                    </div>


                </div>
            </>
        )

    }

}


export default withSnackbar(extern_login)
