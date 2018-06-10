class History extends React.Component {

	constructor() {
		super();
		this.state = ({
			data: []
		});
	}

	componentDidMount() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function (data) {
				this.setState({ data: data });
			}.bind(this),
			error: function (xhr, status, error) {
				console.error(this.props.url, status, error.toString());
			}.bind(this)
		});
	}

	render() {
		var nodes = this.state.data.map(function (comment) {
			return (
				<li class="mdl-list__item">
					<span class="mdl-list__item-primary-content">
						<i class="material-icons mdl-list__item-icon">{comment.icon}</i>{comment.date}:{comment.text}</span>
				</li>
			);
		});
		return (
			<ul class="mdl-list">
				{nodes}
			</ul>
		);
	}
}

class Contents extends React.Component {
	render() {
		return (
			<React.Fragment>
				<a name="top"></a>
				<div class="minir-be-together-section mdl-typography--text-center">
					<div class="logo-font minir-slogan">MinIR</div>
					<div class="logo-font minir-sub-slogan">It is an IR designed for beatoraja.</div>
				</div>
				<div class="minir-screen-section mdl-typography--text-center">
					<a name="screens"></a>
					<div class="mdl-typography--display-1-color-contrast">Update history</div>
					<History url="./history.json" />
				</div>
				<footer class="minir-footer mdl-mega-footer">
					<div class="mdl-mega-footer--top-section">
					<div class="mdl-mega-footer--right-section">
						<a class="mdl-typography--font-light" href="#top">
						Back to Top
						<i class="material-icons">expand_less</i>
						</a>
					</div>
					</div>
				</footer>
			</React.Fragment>
		);
	}
}

ReactDOM.render(
	<Contents />,
	document.getElementById('contents')
);