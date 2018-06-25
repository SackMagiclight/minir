class Header extends React.Component {

    constructor() {
        super();
        this.state = ({
            AccessToken: Cookies.get('AccessToken'),
            RefreshToken: Cookies.get('RefreshToken')
        });
    }

    render() {
        return (
            <React.Fragment>
                {(() => {
                    if (!this.state.AccessToken || !this.state.RefreshToken) {
                        return <a class="mdl-navigation__link mdl-typography--text-uppercase" href="/minir/signup">Sign up</a>;
                    }
                })()}
                {(() => {
                    if (!this.state.AccessToken || !this.state.RefreshToken) {
                        return <a class="mdl-navigation__link mdl-typography--text-uppercase" href="/minir/user/login">Login</a>;
                    }
                })()}
                {(() => {
                    if (this.state.AccessToken && this.state.RefreshToken) {
                        return <a class="mdl-navigation__link mdl-typography--text-uppercase" href="/minir/user/logout">Logout</a>;
                    }
                })()}
                {(() => {
                    if (this.state.AccessToken && this.state.RefreshToken) {
                        return <a class="mdl-navigation__link mdl-typography--text-uppercase" href="/minir/user/">Setting</a>;
                    }
                })()}
            </React.Fragment>
        );
    }
}

ReactDOM.render(
    <Header />,
    document.getElementById('header_nav')
);