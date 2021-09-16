import React,{useEffect} from "react";
import SSO_service from "../../provider/SSO_service";
import MuiBackdrop from "../../components/Loading/MuiBackdrop";
import '../../assets/css/phone-input2-material.css'
import moment from "moment";
import { useSnackbar } from 'notistack';
import {Label, Popup} from "semantic-ui-react";
import Textfield from "@atlaskit/textfield";
import AtlButton from "@atlaskit/button";
import SearchIcon from "@material-ui/icons/Search";
import DataTable from "react-data-table-component";
import {paginationOptions, tableContextMessage} from "../../constants/defaultValues";


export default function Admin(props){

    const admin_users_columns = [
        /*{
            name: 'Action',
            cell: row => <div>
                <IconButton>
                    <Edit />
                </IconButton>
            </div>,
            grow:0.1
        },*/
        {
            name: 'Email',
            selector: 'email',
            sortable: true,
        },
        {
            name: 'Username',
            selector: 'username',
            sortable: true,
        },
        {
            name: 'roles',
            cell: row => <div style={{paddingBottom:10}}>
                {
                    (row.roles || []).map( item => (
                        <Label as='a' basic color='blue' pointing size="mini">
                            {item.role}
                        </Label>
                    ))
                }
            </div>,
        },
        {
            name: 'Registres',
            cell: row => <div style={{paddingBottom:10}}>
                {
                    (row.registries || []).map( item => (
                        <Popup content={
                            <div style={{display:"flex"}}>
                                <SearchIcon fontSize={"small"} color="primary"/>
                                <h6 style={{fontSize:"0.7rem",marginLeft:3,marginTop:4}}>Voir détails</h6>
                            </div>
                        }
                               wide='very'
                               size={"small"}
                               trigger={
                                   <Label as='a' basic color='blue' pointing size="mini">
                                       {item.registry.name.main}
                                   </Label>
                               }
                        />
                    ))
                }
            </div>,
        }
    ];

    const { enqueueSnackbar } = useSnackbar();
    const [is_have_acces_to_search_users, setIs_have_acces_to_search_users] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const [user_search_input, setUser_search_input] = React.useState("");
    const [admin_users, setAdmin_users] = React.useState();
    const [loadingBtnSearch, setLoadingBtnSearch] = React.useState(false);

    useEffect(() => {
            if(verifSession() === true){
                verif_acces_roles()
            }else{
                props.history.push("/sso/login")
            }
    }, [verif_acces_roles]);

    const verifSession = () => {
        return !(localStorage.getItem("usrtoken") === null || localStorage.getItem("usrtoken") === undefined || moment(localStorage.getItem("exp")) < moment());
    }
    const verif_acces_roles = () => {
        let roles = JSON.parse(localStorage.getItem("roles")) || []
        console.log(roles)
        if(roles.find(x => x.role === "admin" || x.role === "creator")){
            setIs_have_acces_to_search_users(true)
        }
    }


    const admin_search_users = (query) => {
        setLoadingBtnSearch(true)
        setLoading(true)
        SSO_service.admin_users_search(query,localStorage.getItem("usrtoken")).then(searchRes => {
            console.log(searchRes)
            if(searchRes.status === 200 && searchRes.succes === true){
                let formated_users = [];
                (searchRes.data.users || []).map( item => {
                    SSO_service.getAdminUserInfo(item,localStorage.getItem("usrtoken")).then( infoRes => {
                        console.log(infoRes)
                        if(infoRes && infoRes.status === 200 && infoRes.succes === true){
                            let roles_object = infoRes.data.roles || {}
                            const roles_array = [];
                            Object.keys(roles_object).forEach(key => roles_array.push({
                                role: key,
                                data: roles_object[key]
                            }));
                            SSO_service.get_admin_user_registries(item,localStorage.getItem("usrtoken")).then( regsRes => {
                                if(regsRes && regsRes.status === 200 && regsRes.succes === true){
                                    formated_users.push({
                                        id:item,
                                        email:infoRes.data.email,
                                        username:infoRes.data.username,
                                        roles:roles_array,
                                        registries:regsRes.data.registries || []
                                    })
                                    setAdmin_users(formated_users)
                                }else{
                                    console.log(regsRes ? regsRes.error : "500 error")
                                }
                            })
                        }else{
                            console.log(infoRes ? infoRes.error : "500 error")
                        }
                    })
                })
                setTimeout(() => {
                    setLoading(false)
                    setLoadingBtnSearch(false)
                },1500)
            }else{
                console.log(searchRes.error)
            }
        }).catch(err => {
            console.log(err)
        })
    }

    return(

        <div>
            <MuiBackdrop open={loading}/>

            {
                is_have_acces_to_search_users === true &&
                <div className="container container-lg" style={{marginTop:30}}>
                    <div className="info_form">
                        <div>
                            <div className="main_padding-form">
                                <h5 style={{fontSize:"1.25rem"}}>Utilisateurs</h5>
                                <label style={{color:"#5f6368",fontSize:12}}>Utiliser le champ de recherche pour trouver n'importe quel utilisateur</label>

                                <div className="row mb-3 mt-3">
                                    <div className="col-md-6">
                                        <Textfield name="basic" placeholder="Chercher..." style={{maxWidth:350}}
                                                   value={user_search_input} onChange={event => setUser_search_input(event.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3" style={{alignSelf:"center"}}>
                                        <AtlButton appearance="primary" className="alt-font"
                                                   iconBefore={<SearchIcon/>}
                                                   isLoading={loadingBtnSearch}
                                                   onClick={() => {
                                                       admin_search_users(user_search_input)
                                                   }}
                                        >
                                            Chercher
                                        </AtlButton>
                                    </div>
                                </div>
                                {
                                    admin_users && Array.isArray(admin_users) &&
                                    <div style={{marginTop:30}}>
                                        <DataTable
                                            columns={admin_users_columns}
                                            data={admin_users}
                                            defaultSortField="email"
                                            selectableRows={false}
                                            selectableRowsHighlight={true}
                                            /*onSelectedRowsChange={selected => {
                                                console.log(selected)
                                            }}*/
                                            pagination={true}
                                            paginationPerPage={10}
                                            paginationComponentOptions={paginationOptions}
                                            highlightOnHover={false}
                                            contextMessage={tableContextMessage}
                                            progressPending={admin_users === null || admin_users === undefined}
                                            progressComponent={<h6>Chargement...</h6>}
                                            noDataComponent="Il n'y a aucun utilisateur à afficher"
                                            noHeader={true}
                                            pointerOnHover={true}
                                            onRowClicked={(row, e) => {
                                                //props.history.push("/main/pro/registre/" + row.registery.id )
                                            }}
                                        />
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )

}
