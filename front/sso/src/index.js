import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { SnackbarProvider } from 'notistack';
import './App.css'
import './assets/css/semantic-ui_clone.css'

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#1a73e8',
        },
        secondary: {
            main: '#11cb5f',
        },
        custom: {
            main: '#00AEF9'
        }

    },
});


ReactDOM.render(
    <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={5}>
            <App/>
        </SnackbarProvider>
    </ThemeProvider>,
    document.getElementById("root"));

serviceWorker.unregister();
