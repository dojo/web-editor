import Editor from '../Editor';
import project from '../project';
import Runner from '../Runner';
import getGists from '../support/getGists';

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

const editor = new Editor(editorDiv);
const runner = new Runner(runnerIframe);

async function runButtonClick(evt: Event) {
	evt.preventDefault();
	runButton.setAttribute('disabled', 'disabled');
	await runner.run();
	runButton.removeAttribute('disabled');
}

function selectFileSelectChange(evt: Event) {
	evt.preventDefault();
	editor.display(selectFileSelect.value);
}

async function loadProjectButtonClick() {
	projectSelect.setAttribute('disabled', 'disabled');
	loadProjectButton.setAttribute('disabled', 'disabled');
	await project.load(projectSelect.value);
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

async function loadGistsButtonClick() {
	const username = usernameInput.value;
	console.log(`Loading gists for "${username}"...`);
	if (!username) {
		return;
	}
	loadGistsButton.setAttribute('disabled', 'disabled');
	const gists = await getGists(username);
	if (!gists.length) {
		console.warn('No valid gists found.');
		loadGistsButton.removeAttribute('disabled');
		return;
	}
	loadGistsButton.removeEventListener('click', loadGistsButtonClick);
	gists.forEach(({ description, projectJson }) => {
		const option = document.createElement('option');
		option.value = projectJson;
		option.text = description;
		projectSelect.appendChild(option);
	});
	loadProjectButton.addEventListener('click', loadProjectButtonClick);
	projectListDiv.classList.remove('hidden');
}

loadGistsButton.addEventListener('click', loadGistsButtonClick);

loadGistsButton.removeAttribute('disabled');
