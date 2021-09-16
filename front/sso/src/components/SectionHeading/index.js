import React from 'react';
import PropTypes from 'prop-types';
import ButtonGroup from 'react-rainbow-components/components/ButtonGroup';
import ButtonIcon from 'react-rainbow-components/components/ButtonIcon';
import AvatarMenu from 'react-rainbow-components/components/AvatarMenu';
import Avatar from 'react-rainbow-components/components/Avatar';
import Input from 'react-rainbow-components/components/Input';
import MenuItem from 'react-rainbow-components/components/MenuItem';
import MenuDivider from 'react-rainbow-components/components/MenuDivider';
import ButtonMenu from 'react-rainbow-components/components/ButtonMenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faRocket,
    faAngleDown,
    faBullhorn,
    faSearch,
    faPencilAlt,
    faPowerOff,
} from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-regular-svg-icons';
import {
    ShoppingCartIcon,
    MessageIcon,
    BarsIcon,
    GithubIcon,
} from '../icons';
import Notification from './notification';
import IconNotification from './iconNotification';
import './styles.css';

export default function SectionHeading({ onToogleSidebar }) {
    const user_full_name = localStorage.getItem("firstname") + " " + localStorage.getItem("lastname")
    return (
        <header className="react-rainbow-admin_header rainbow-position_fixed rainbow-flex rainbow-align_center rainbow-p-horizontal_large rainbow-background-color_white">
            <img src={require("../../assets/logos/default.png")} alt="rainbow logo" className="react-rainbow-admin_header-logo" />
            <section className="rainbow-flex rainbow-align_center react-rainbow-admin_header-actions">

                {/*<ButtonMenu
                    className="rainbow-m-horizontal_medium react-rainbow-admin_header-button-notification"
                    menuAlignment="right"
                    buttonVariant="base"
                    buttonSize="large"
                    icon={<FontAwesomeIcon icon={faBell} />}>
                    <MenuItem label="Notifications (2)" variant="header" />
                    <MenuItem
                        icon={
                            <IconNotification icon={<ShoppingCartIcon className="react-rainbow-admin_header--notification-icon" />} />
                        }
                        label={(
                            <Notification
                                title="Notif 1" />
                        )} />
                    <MenuItem
                        icon={
                            <IconNotification icon={<MessageIcon className="react-rainbow-admin_header--notification-icon" />} />
                        }
                        label={(
                            <Notification
                                title="Notif 2" />
                        )} />
                </ButtonMenu>*/}
                <AvatarMenu
                    assistiveText={user_full_name}
                    menuAlignment="right"
                    menuSize="small"
                    title={user_full_name}
                    initials={localStorage.getItem("email").charAt(0).toUpperCase() + localStorage.getItem("email").charAt(1).toUpperCase()}

                >
                    <li className="rainbow-p-horizontal_small rainbow-align_center rainbow-flex">
                        <Avatar
                            src={require("../../assets/images/default_avatar.jpg")}
                            assistiveText={user_full_name}
                            title={user_full_name}
                            size="medium" />
                        <div className="rainbow-m-left_x-small">
                            <p className="rainbow-font-size-text_medium rainbow-color_dark-1">{user_full_name}</p>
                            <p className="rainbow-font-size-text_small rainbow-color_gray-3">{localStorage.getItem("email")}</p>
                        </div>
                    </li>
                    <MenuDivider variant="space" />
                    <MenuItem
                        label="Déconnexion"
                        icon={<FontAwesomeIcon icon={faPowerOff} color="red" />}
                        iconPosition="left"
                        onClick={() => {
                            localStorage.removeItem("usrtoken")
                            localStorage.removeItem("firstname")
                            localStorage.removeItem("lastname")
                            localStorage.removeItem("exp")
                            localStorage.removeItem("roles")
                            window.location.reload()
                        }}
                    />
                </AvatarMenu>
            </section>
            <ButtonIcon
                onClick={onToogleSidebar}
                className="react-rainbow-admin_header-hamburger-button"
                size="large"
                icon={<BarsIcon />} />
        </header>
    );
}

SectionHeading.propTypes = {
    onToogleSidebar: PropTypes.func,
};

SectionHeading.defaultProps = {
    onToogleSidebar: () => {},
};
