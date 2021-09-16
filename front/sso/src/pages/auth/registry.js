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





class registry extends Component {



    state = {
        loading:false,
        key:"",
        registries:[],
        infos:[]
    };


    componentDidMount() {

        let key = this.props.match.params.key;
        let registries = this.props.match.params.registries.split(",") || []
        let infos = this.props.match.params.infos.split(",") || []

        if(typeof key === "string" && typeof Array.isArray(registries) && Array.isArray(infos)){
            console.log(key,registries,infos)
            this.setState({registries,key,infos})
        }else{
            this.props.enqueueSnackbar("Url invalide ou n'est plus disponible !", { variant:"error" })
        }

    }


    registry_signin = () => {
        this.setState({loading:true})
        setTimeout(() => {
            SSO_service.registry_signin(this.props.match.params.registries,this.props.match.params.key,{asked:this.state.infos},
                localStorage.getItem("usrtoken")).then(registryRes => {
                console.log(registryRes)
                if(registryRes.status === 200 && registryRes.succes === true){
                    this.props.enqueueSnackbar("Opération effectuées avec succès", { variant:"success" })
                    setTimeout(() => {
                        this.setState({loading:false})
                        this.props.history.push("/main/dash")
                    },2000)
                }else{
                    this.props.enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
                    this.setState({loading:false})
                }

            }).catch(err => {
                console.log(err)
                this.setState({loading:false})
                this.props.enqueueSnackbar("Une erreur est survenue !", { variant:"error" })
            })
        },2500)
    }

    handleObjectChange = (object,name) => event => {
        let obj = this.state[object];
        obj[name] = event.target.value;
        this.setState({
            [object]: obj
        });
    };



    render() {
        let {key,registries,infos} = this.state
        let registries_names = "";
        registries.map( (reg,key) => {
            if(reg !== ""){
                registries_names = key === 0 ? reg : registries_names + ", " + reg
            }
        })


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

                                <h5 style={{fontSize:"1.02rem"}}>{registries_names} {registries.length === 1 ? "veut" : "veulent"} accèder à votre: </h5>
                                <ul style={{listStyle:"disc",marginLeft:20,marginTop:5}}>
                                    {
                                        infos.map((info,key) => (
                                            <li style={{fontSize:"1.02rem"}} key={key}>{info === "phone" ? "numéro de téléphone" : info}</li>
                                        ))
                                    }
                                </ul>
                                <h5 style={{marginTop:20,fontSize:"1.1rem"}}>Voulez vous vraiment confirmer cette demande ?</h5>
                                <div className="row mt-4">
                                    <div className="col-md-12">
                                        <div style={{display:"flex",justifyContent:"center"}}>
                                            <Button color="primary" style={{textTransform:"none"}}
                                                    onClick={() => this.props.history.push("/sso/login")}>Annuler</Button>
                                            <Button variant="contained" style={{textTransform:"none",marginLeft:15}}
                                                    onClick={() => {this.registry_signin()}}
                                                    color="primary">Confirmer</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </>
        )

    }

}


export default withSnackbar(registry)
