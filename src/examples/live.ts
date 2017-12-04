import { w } from '@dojo/widget-core/d';
import ProjectorMixin from '@dojo/widget-core/mixins/Projector';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import LiveCodeController from '../LiveCodeController';
import LiveCodeExample from '../LiveCodeExample';
import project from '../project';
import { load as loadTheme } from '../support/editorThemes';

const EDITOR_THEME = '../../data/editor-dark.json';
const PROJECT_JSON = '../../../projects/live-editor.project.json';

const GREEKING = `Quidne tamen pulvinar ratis verto antehabeo quidne. Haero letatio semper ex zelus autem etiam. Utrum sino ratis validus nec. Sino delenit pecus vulpes autem ventosus. Saepius roto vindico himenaeos utinam sed mus probo. Pulvinar sed nam vestibulum curabitur gravida. Condimentum reprobo gravis semper morbi letalis tum scelerisque torquent. Platea ne sudo praesent leo secundum.`;

const text = `import WidgetBase from '@dojo/widget-core/WidgetBase';
import ProjectorMixin from '@dojo/widget-core/mixins/Projector';
import { w } from '@dojo/widget-core/d';
import Button from '@dojo/widgets/button/Button';
import theme from '@dojo/widgets/themes/dojo/theme';

class HelloWorld extends WidgetBase {
	render() {
		return w(Button, {
			theme,
			onClick() { alert('I was clicked!'); }
		}, [ 'Click me!' ]);
	}
}

const projector = new (ProjectorMixin(HelloWorld))();
projector.append();
`;

const text1 = `import WidgetBase from '@dojo/widget-core/WidgetBase';
import ProjectorMixin from '@dojo/widget-core/mixins/Projector';
import { tsx } from '@dojo/widget-core/tsx';

class HelloWorld extends WidgetBase {
	render() {
		return (
			<div>
				Hello world!
			</div>
		);
	}
}

const projector = new (ProjectorMixin(HelloWorld))();
projector.append();
`;

class App extends WidgetBase {
	public render() {
		return w(LiveCodeController, {
			project,
			runnerSrc: './loading.html'
		}, [
			w(LiveCodeExample, {
				id: 'example_001',
				description: GREEKING,
				key: 'example_001',
				title: 'Example 1'
			}, [ text ]),
			w(LiveCodeExample, {
				id: 'example_002',
				description: GREEKING,
				key: 'example_002',
				title: 'Example 2',
				tsx: true
			}, [ text1 ])
		]);
	}
}

const projector = new (ProjectorMixin(App))();

(async function () {
	await loadTheme(EDITOR_THEME);
	await project.load(PROJECT_JSON);

	projector.append();
})();
