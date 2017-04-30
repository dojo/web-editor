import request from '@dojo/core/request';
import Task from '@dojo/core/async/Task';
import Editor from '../Editor';
import project from '../project';
import Runner from '../Runner';

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

interface GistFile {
	'filename': string;
	'type': string;
	'language': string;
	'raw_url': string;
	'size': number;
}

interface Gist {
	'url': string;
	'forks_url': string;
	'commits_url': string;
	'id': string;
	'git_pull_url': string;
	'git_push_url': string;
	'html_url': string;
	'files': { [filename: string]: GistFile };
	'public': boolean;
	'created_at': string;
	'updated_at': string;
	'description': string;
	'comments': number;
	'user': string | null;
	'comments_url': string;
	'owner': {
		'login': string;
		'id': number;
		'avatar_url': string;
		'gravatar_id': string;
		'url': string;
		'html_url': string;
		'followers_url': string;
		'following_url': string;
		'gists_url': string;
		'starred_url': string;
		'subscriptions_url': string;
		'organizations_url': string;
		'repos_url': string;
		'events_url': string;
		'received_events_url': string;
		'type': string;
		'site_admin': boolean;
	};
	'truncated': boolean;
}

async function getGists(username: string): Task<{ description: string; projectJson: string; }[]> {
	const response = await request.get(`https://api.github.com/users/${username}/gists`);
	const gists = await response.json<Gist[]>();
	return gists
		.filter((gist) => {
			for (const key in gist.files) {
				return gist.files[key].type === 'application/json' && gist.files[key].filename.toLowerCase() === 'project.json';
			}
		})
		.map((gist) => {
			let projectJson = '';
			for (const key in gist.files) {
				const file = gist.files[key];
				if (file.type === 'application/json' && file.filename.toLowerCase() === 'project.json') {
					projectJson = file['raw_url'].replace('gist.githubusercontent.com', 'rawgit.com');
				}
			}
			console.log(gist.description, projectJson);
			return {
				description: gist.description,
				projectJson
			};
		});
}

async function runButtonClick(evt: Event) {
	evt.preventDefault();
	runButton.setAttribute('disabled', 'disabled');
	await runner.run();
	runButton.removeAttribute('disabled');
}

function selectFileSelectChange(evt: Event) {
	evt.preventDefault();
	editor.display(selectFileSelect.getAttribute('value')!);
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
	console.log(gists);
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
