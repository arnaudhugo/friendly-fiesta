import React from 'react';
import {
    Router,
    Switch,
    Route,
} from 'react-router-dom';
import history from './history';
import Dashboard from "./dashboard";
import Info from "./infos";
import Admin from "./admin";
import Pro from "./pro"
import RegistreDetails from "./registreDetails";

export default function Routes() {
    return (
        <Router history={history}>
            <Switch>
                <Route exact path="/main/dash" component={Dashboard} />
                <Route exact path="/main/infos" component={Info} />
                <Route exact path="/main/admin" component={Admin} />
                <Route exact path="/main/pro" component={Pro} />
                <Route exact path="/main/pro/registre/:reg" component={RegistreDetails} />
            </Switch>
        </Router>
    );
}
