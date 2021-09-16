import React from 'react';
import PropTypes from 'prop-types';

export default function Twitter(props) {
    const {
        className,
        style,
    } = props;
    return (

        <svg id="Capa_1" enable-background="new 0 0 508.54 508.54" height="512" viewBox="0 0 508.54 508.54" width="512"
             xmlns="http://www.w3.org/2000/svg">
            <g>
                <path
                    d="m378.37 277.03v140.86h-167.02v-239.43h22.72c46.1 0 89.46 20.31 118.97 55.72 10.07 12.07 18.21 25.57 24.2 40.1z"
                    fill="#2682ff"/>
                <path
                    d="m211.35 178.46v239.43h-179.58v-84.05c0-36.53 12.98-72.01 36.54-99.92l.44-.51c29.49-34.93 72.62-54.95 118.32-54.95z"
                    fill="#2fc0f0"/>
                <path d="m476.77 350.45-44.25 52.88 24.11 83.69-21.52 21.52-83.34-45.45v-208.09h17.08l28.88 65h79.04z"
                      fill="#ff9f22"/>
                <path d="m351.77 255v208.09l-83.34 45.45-21.52-21.52 24.11-83.69-44.25-52.88v-30.45h79.35l31.21-65z"
                      fill="#ffda44"/>
                <path d="m315.57 104.23c0 57.47-46.75 104.23-104.22 104.23v-208.46c57.47 0 104.22 46.76 104.22 104.23z"
                      fill="#2fc0f0"/>
                <path d="m211.35 0v208.46c-57.48 0-104.23-46.76-104.23-104.23s46.75-104.23 104.23-104.23z"
                      fill="#9ee2f8"/>
            </g>
        </svg>
    );
}

Twitter.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
};
Twitter.defaultProps = {
    className: undefined,
    style: undefined,
};
