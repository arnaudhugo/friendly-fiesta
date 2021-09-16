import React, {Component} from "react";
import MuiBackdrop from "../../components/Loading/MuiBackdrop";
import { Progress } from 'semantic-ui-react'
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import './login_signup.css'
import SSO_service from "../../provider/SSO_service";
import { withSnackbar } from 'notistack';
import verifForms from "../../tools/verifForms"





class reset extends Component {



    state = {
        loading:false,
        show_pwd:false,

        reset_form:{
            email:this.props.match.params.email || "",
            key:this.props.match.params.key || "",
            newPwd1:"",
            newPwd2:""
        }
    };


    componentDidMount() {
        console.log(this.props.match.params)
    }

    handleObjectChange = (object,name) => event => {
        let obj = this.state[object];
        obj[name] = event.target.value;
        this.setState({
            [object]: obj
        });
    };

    reset(){

        if(this.state.reset_form.newPwd1 === this.state.reset_form.newPwd2){
            if(verifForms.verif_Email(this.state.reset_form.email) === false){

                this.setState({loading:true})
                setTimeout(() => {

                    SSO_service.changePassword({key:this.state.reset_form.key,email:this.state.reset_form.email,password:this.state.reset_form.newPwd1},"").then(changeRes => {
                        if (changeRes.status === 200 && changeRes.succes === true) {
                            this.props.enqueueSnackbar('Votre mot de passe est changé avec succès', { variant:"success" })
                            this.setState({loading:false})
                            setTimeout(() => {

                                this.props.enqueueSnackbar('Redirection à la page de connexion....', { variant:"success" })
                                setTimeout(() => {
                                    localStorage.removeItem("usrtoken")
                                    localStorage.removeItem("firstname")
                                    localStorage.removeItem("lastname")
                                    localStorage.removeItem("exp")
                                    this.props.history.push("/sso/login")
                                },2000)
                            },2000)
                        }else{
                            this.props.enqueueSnackbar(changeRes.error, { variant:"error" })
                            this.setState({loading:false})
                        }
                    }).catch(err => {
                        console.log(err)
                        this.props.enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
                        this.setState({loading:false})
                    })

                },1000)
            }else{
                this.props.enqueueSnackbar("Url invalide ou n'est plus disponible !", { variant:"error" })
            }
        }else{
            this.props.enqueueSnackbar("Url invalide ou n'est plus disponible !!", { variant:"error" })

        }




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
                        <div style={{display:"flex"}}>
                            <div className="padding-form">

                                <h5 style={{fontSize:"1.25rem"}}>Réinitialiser mot de passe</h5>
                                <h6 style={{marginTop:10}}>Veuillez saisir votre nouveau mot de passe d'une manière sécurisé</h6>

                                <form id="login-form" style={{maxWidth:500,alignSelf:"center"}}
                                      onSubmit={(e) => {
                                          e.preventDefault(); e.stopPropagation();
                                          this.login()
                                      }}
                                >
                                    {
                                        (!this.props.match.params.key || this.props.match.params.key === "") &&
                                        <div className="row mt-2">
                                            <div className="col-md-12 mt-2">
                                                <TextField
                                                    label="Code"
                                                    type="text"
                                                    variant="outlined"
                                                    size="small"
                                                    style={{width:"100%"}}
                                                    required={true}
                                                    value={this.state.reset_form.key}
                                                    onChange={this.handleObjectChange('reset_form','key')}
                                                />
                                            </div>
                                        </div>
                                    }

                                    <div className="row mt-2">
                                        <div className="col-md-12 mt-2">
                                            <TextField
                                                label="Nouveau mot de passe"
                                                type="text"
                                                variant="outlined"
                                                size="small"
                                                style={{width:"100%"}}
                                                required={true}
                                                value={this.state.reset_form.newPwd1}
                                                onChange={this.handleObjectChange('reset_form','newPwd1')}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-md-12 mt-2">
                                            <TextField
                                                label="Confirmer votre mot de passe"
                                                type="text"
                                                variant="outlined"
                                                size="small"
                                                style={{width:"100%"}}
                                                required={true}
                                                value={this.state.reset_form.newPwd2}
                                                onChange={this.handleObjectChange('reset_form','newPwd2')}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mt-4">
                                        <div className="col-md-12">
                                            <div style={{display:"flex"}}>
                                                <Button color="primary" style={{textTransform:"none"}}
                                                        onClick={() => this.props.history.push("/sso/login")}>Annuler</Button>
                                                <Button variant="contained" style={{textTransform:"none",marginLeft:15}}
                                                        onClick={() => this.reset()}
                                                        color="primary">Envoyer</Button>
                                            </div>
                                        </div>
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


export default withSnackbar(reset)
