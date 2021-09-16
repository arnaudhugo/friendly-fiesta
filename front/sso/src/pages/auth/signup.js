import React, {Component} from "react";
import MuiBackdrop from "../../components/Loading/MuiBackdrop";
import { Progress } from 'semantic-ui-react'
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import './login_signup.css'
import LinearProgress from "@material-ui/core/LinearProgress";
import SSO_service from "../../provider/SSO_service";
import { withSnackbar } from 'notistack';

class signup extends Component {


    state = {
        loading:false,
        show_pwd:false,

        signup_form:{
            firstname:"",
            lastname:"",
            email:"",
            pwd1:"",
            pwd2:""
        }
    };

    componentDidMount() {}


    handleObjectChange = (object,name) => event => {
        let obj = this.state[object];
        obj[name] = event.target.value;
        this.setState({
            [object]: obj
        });
    };

    sign_up(){
        this.setState({loading:true})
        setTimeout(() => {
            SSO_service.register({email:this.state.signup_form.email,pass1:this.state.signup_form.pwd1,pass2:this.state.signup_form.pwd2}).then(registerRes => {
                console.log(registerRes)
                if(registerRes.status === 200 && registerRes.succes === true){

                    SSO_service.getUser(registerRes.data.usrtoken).then(infoRes => {
                        console.log(infoRes)
                        if(infoRes.status === 200 && infoRes.succes === true){

                            localStorage.setItem("email",this.state.signup_form.email)
                            this.props.enqueueSnackbar("Votre inscription est effectuée avec succès !",
                                {variant:"success"})
                            localStorage.setItem("firstname",infoRes.data.first_name.main || "")
                            localStorage.setItem("lastname",infoRes.data.last_name.main || "")
                            localStorage.setItem("usrtoken",registerRes.data.usrtoken)
                            localStorage.setItem("exp",registerRes.data.exp)

                            let roles_object = infoRes.data.roles || {}
                            const roles_array = [];
                            Object.keys(roles_object).forEach(key => roles_array.push({
                                role: key,
                                data: roles_object[key]
                            }));
                            localStorage.setItem("roles",JSON.stringify(roles_array))

                            setTimeout(() => {
                                this.setState({loading:false})
                                this.props.history.push("/main/dash")
                            },1000)

                        }else{

                        }

                    }).catch(err => {console.log(err)})


                }else{
                    this.setState({loading:false})
                    this.props.enqueueSnackbar(registerRes.error, {variant:"error"})
                }
            }).catch(err => {
                console.log(err)
                this.props.enqueueSnackbar("Une erreur est survenue !", {variant:"error"})
                this.setState({loading:false})
            })
        },2000)
    }


    render() {

        return (
           <>
               <MuiBackdrop open={this.state.loading}/>

               <div className="container container-lg" style={{marginTop:100}}>

                   <div className="signup_form">
                       {
                           this.state.loading === true ?
                               <LinearProgress /> :
                               <Progress active={false} percent={100} size="medium" className="custom-progress-height" color='blue' />
                       }
                       <div style={{display:"flex"}}>
                           <div className="padding-form">

                               <h5 style={{fontSize:"1.8rem"}}>Créer votre compte</h5>

                               <form id="signup-form" style={{maxWidth:500,alignSelf:"center"}}
                                     onSubmit={(e) => {
                                         e.preventDefault(); e.stopPropagation();
                                         if(this.state.signup_form.pwd1 === this.state.signup_form.pwd2){
                                             this.sign_up()
                                         }else{
                                             this.props.enqueueSnackbar("Les deux mot de passes ne sont pas identiques !", {variant:"error"})
                                         }
                                     }}
                               >
                                   <div className="row mt-4">
                                       <div className="col-md-6 mt-2">
                                           <TextField
                                               label="Nom"
                                               variant="outlined"
                                               size="small"
                                               style={{width:"100%"}}
                                               //required={true}
                                               value={this.state.signup_form.firstname}
                                               onChange={this.handleObjectChange('signup_form','firstname')}
                                           />
                                       </div>
                                       <div className="col-md-6 mt-2">
                                           <TextField
                                               label="Prénom"
                                               variant="outlined"
                                               size="small"
                                               style={{width:"100%"}}
                                               //required={true}
                                               value={this.state.signup_form.lastname}
                                               onChange={this.handleObjectChange('signup_form','lastname')}
                                           />
                                       </div>
                                   </div>
                                   <div className="row mt-2">
                                       <div className="col-md-12 mt-2">
                                           <TextField
                                               label="Email"
                                               variant="outlined"
                                               size="small"
                                               style={{width:"100%"}}
                                               required={true}
                                               inputProps={{pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,8}$",title:"Veuillez saisir une adresse mail valide !" }}
                                               value={this.state.signup_form.email}
                                               onChange={this.handleObjectChange('signup_form','email')}
                                           />
                                       </div>
                                       <div className="col-md-12 mt-2">
                                           <label style={{color:"#5f6368",fontSize:12}}>Vous pouvez utiliser des lettres, des chiffres et des points</label>
                                       </div>
                                   </div>
                                   <div className="row mt-2">
                                       <div className="col-md-6 mt-2">
                                           <TextField
                                               label="Mot de passe"
                                               type={this.state.show_pwd === true ? "text" : "password"}
                                               variant="outlined"
                                               size="small"
                                               style={{width:"100%"}}
                                               required={true}
                                               value={this.state.signup_form.pwd1}
                                               onChange={this.handleObjectChange('signup_form','pwd1')}
                                           />
                                       </div>
                                       <div className="col-md-6 mt-2">
                                           <TextField
                                               label="Confirmer"
                                               type={this.state.show_pwd === true ? "text" : "password"}
                                               variant="outlined"
                                               size="small"
                                               style={{width:"100%"}}
                                               required={true}
                                               value={this.state.signup_form.pwd2}
                                               onChange={this.handleObjectChange('signup_form','pwd2')}
                                           />
                                       </div>
                                       <div className="col-md-12 mt-2">
                                           <label style={{color:"#5f6368",fontSize:12}}>Utilisez au moins huit caractères avec des lettres, des chiffres et des symboles</label>
                                       </div>
                                   </div>
                                   <div className="row">
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
                                   <div className="row mt-3">
                                       <div className="col-md-12">
                                           <div style={{display:"flex"}}>
                                               <Button color="primary" style={{textTransform:"none"}}
                                                       onClick={() => this.props.history.push("/sso/login")}>Se connecter à un compte existant</Button>
                                               <Button type="submit" variant="contained" style={{textTransform:"none",marginLeft:15}} color="primary">S'inscrire</Button>
                                           </div>
                                       </div>
                                   </div>
                               </form>
                           </div>
                           <img alt="" src={require("../../assets/images/signup2.jpg")} className="signup_img"/>
                       </div>

                   </div>
               </div>
           </>
        )

    }

}

export default withSnackbar(signup);
