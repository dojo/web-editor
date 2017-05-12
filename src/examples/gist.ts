import Map from '@dojo/shim/Map';
import Editor from '../Editor';
import project from '../project';
import Runner from '../Runner';
import { getByUsername, getById } from '../support/gists';
import { startGistRouter, setPath } from '../routing';

/* References to page elements */
const titleH2 = document.getElementById('title') as HTMLHeadingElement;
const githubUsernameDiv = document.getElementById('github-username') as HTMLDivElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const loadGistsButton = document.getElementById('load-gists') as HTMLButtonElement;
const projectListDiv = document.getElementById('project-list') as HTMLDivElement;
const projectSelect = document.getElementById('project') as HTMLSelectElement;
const loadProjectButton = document.getElementById('load-project') as HTMLButtonElement;
const fileListDiv = document.getElementById('file-list') as HTMLDivElement;
const selectFileSelect = document.getElementById('select-file') as HTMLSelectElement;
const runButton = document.getElementById('run') as HTMLButtonElement;

const editorDiv = document.getElementById('editor') as HTMLDivElement;
const runnerIframe = document.getElementById('runner') as HTMLIFrameElement;

/* The editor and runner instances for the page */
const editor = new Editor(editorDiv);
const runner = new Runner(runnerIframe);

/**
 * A map for storing project.json URLs mapped to the gist ID
 */
const gistIDMap = new Map<string, string>();

/**
 * Listener that runs the project in the runner
 * @param evt The click event
 */
async function runButtonClick(evt: Event) {
	evt.preventDefault();
	runButton.setAttribute('disabled', 'disabled');
	await runner.run();
	runButton.removeAttribute('disabled');
}

/**
 * Listener that changes the editor's current file
 * @param evt The change event
 */
function selectFileSelectChange(evt: Event) {
	evt.preventDefault();
	editor.display(selectFileSelect.value);
}

/**
 * Load the project and populate the UI with the project files
 * @param filename A filename URL that should be loaded
 */
async function loadProject(filename: string) {
	await project.load(filename);
	const projectBundle = project.get()!;
	console.log(`Loaded. Project contains ${projectBundle.files.length + projectBundle.environmentFiles.length} files.`);

	/* generate UI for selecting a file */
	project.getFileNames()
		.sort((a, b) => a < b ? -1 : 1)
		.forEach((name) => {
			const option = document.createElement('option');
			option.value = name;
			option.text = name;
			selectFileSelect.appendChild(option);
		});

	selectFileSelect.addEventListener('change', selectFileSelectChange);
	editor.display(selectFileSelect.value);

	runButton.addEventListener('click', runButtonClick);

	fileListDiv.classList.remove('hidden');
}

/**
 * Listener that uses the value from the project select to load the project
 */
async function loadProjectButtonClick() {
	projectSelect.setAttribute('disabled', 'disabled');
	loadProjectButton.setAttribute('disabled', 'disabled');
	await loadProject(projectSelect.value);
	titleH2.textContent = projectSelect.selectedOptions[0].text;
	setPath(gistIDMap.get(projectSelect.value!)!);
}

/**
 * Use the username input to retrieve all the public gists for a user, looking for those that contain a
 * `package.json` that can be loaded.
 */
async function loadGistsButtonClick() {
	const username = usernameInput.value;
	console.log(`Loading gists for "${username}"...`);
	if (!username) {
		return;
	}
	loadGistsButton.setAttribute('disabled', 'disabled');
	const gists = await getByUsername(username);
	if (!gists.length) {
		console.warn('No valid gists found.');
		loadGistsButton.removeAttribute('disabled');
		return;
	}
	loadGistsButton.removeEventListener('click', loadGistsButtonClick);
	gists.forEach(({ description, id, projectJson }) => {
		const option = document.createElement('option');
		option.value = projectJson;
		option.text = description;
		gistIDMap.set(projectJson, id);
		projectSelect.appendChild(option);
	});
	loadProjectButton.addEventListener('click', loadProjectButtonClick);
	projectListDiv.classList.remove('hidden');
}

/* Start the router that will handle taking a gist id and potentially loading the project,
 * or enabling the UI when there is no gist loaded yet */
startGistRouter({
	async onGist(request) {
		if (!project.isLoaded()) {
			const { id } = request.params;
			const gist = await getById(id);
			if (gist) {
				titleH2.textContent = gist.description;
				await loadProject(gist.projectJson);
			}
			else {
				titleH2.textContent = '[Unfound Gist]';
			}
		}
	},

	onRoot() {
		if (!project.isLoaded()) {
			loadGistsButton.addEventListener('click', loadGistsButtonClick);
			githubUsernameDiv.classList.remove('hidden');
		}
	}
});
