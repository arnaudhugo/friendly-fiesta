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





class resetRequest extends Component {



    state = {
        loading:false,
        show_pwd:false,

        reset_form:{
            email:localStorage.getItem("email") || ""
        }
    };


    componentDidMount() {
    }

    handleObjectChange = (object,name) => event => {
        let obj = this.state[object];
        obj[name] = event.target.value;
        this.setState({
            [object]: obj
        });
    };

    resetRequest = () => {
        this.setState({loading:true})
        setTimeout(() => {
            SSO_service.resetRequest({email:this.state.reset_form.email}).then( res => {
                if (res.status === 200 && res.succes === true) {
                    this.setState({loading:false})
                    this.props.enqueueSnackbar("Un e-mail contenant un code de validation vient d'être envoyé à votre adresse mail", { variant:"success" })
                }else{
                    this.props.enqueueSnackbar(res.error, { variant:"error" })
                    this.setState({loading:false})
                }
            }).catch( err => {
                console.log(err)
                this.props.enqueueSnackbar("Une erreur est survenue ! Veuillez essayer ultérieurement", { variant:"error" })
                this.setState({loading:false})
            })
        },1000)

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

                                <h5 style={{fontSize:"1.25rem"}}>Récupération de compte</h5>


                                <form id="login-form" style={{maxWidth:500,alignSelf:"center"}}
                                      onSubmit={(e) => {
                                          e.preventDefault(); e.stopPropagation();
                                          this.resetRequest()
                                      }}
                                >

                                    <div className="row mt-2">
                                        <div className="col-md-12 mt-2">
                                            <TextField
                                                label="Votre adresse mail"
                                                type="text"
                                                variant="outlined"
                                                size="small"
                                                style={{width:"100%"}}
                                                required={true}
                                                value={this.state.reset_form.newPwd1}
                                                onChange={this.handleObjectChange('reset_form','email')}
                                            />
                                        </div>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-md-12">
                                            <h5 style={{marginTop:10,fontWeight:"bold"}}>Obtenez un code de validation</h5>
                                            <h6 style={{marginTop:5}}>Nous vous enverra un code de validation à votre adresse mail</h6>
                                        </div>
                                    </div>
                                    <div align="right" className="mt-4">
                                        <Button type="submit" variant="contained" style={{textTransform:"none",marginLeft:15}}
                                                color="primary">Envoyer</Button>
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


export default withSnackbar(resetRequest)
