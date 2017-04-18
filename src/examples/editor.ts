import Editor from '../Editor';
import project from '../project';
import Runner from '../Runner';

/* get references to key DOM nodes */
const divFile = <HTMLDivElement> document.getElementById('div-file');
const loadProjectButton = <HTMLButtonElement> document.getElementById('load-project');
const projectSelect = <HTMLSelectElement> document.getElementById('project');
const selectFile = <HTMLSelectElement> document.getElementById('select-file');
const runButton = <HTMLButtonElement> document.getElementById('run');

/* create an editor */
const editorDiv = <HTMLDivElement> document.getElementById('editor');
const editor = new Editor(editorDiv, {
	automaticLayout: true /* enables the editor to resize automagically */
});

/* create a runner */
const runnerDiv = <HTMLIFrameElement> document.getElementById('runner');
const runner = new Runner(runnerDiv);

/**
 * Listener that will be attached to the load project button click
 * @param e The mouse event
 */
async function loadProjectButtonClick(e: MouseEvent) {
	e.preventDefault();
	await load('../../../projects/' + projectSelect.value);

	projectSelect.setAttribute('disabled', 'disabled');
	loadProjectButton.setAttribute('disabled', 'disabled');
	loadProjectButton.removeEventListener('click', loadProjectButtonClick);
}

async function runButtonClick(e: MouseEvent) {
	e.preventDefault();
	runButton.setAttribute('disabled', 'disabled');
	await runner.run();
	runButton.removeAttribute('disabled');
}

/**
 * Listener that will be attached to the file select when there is a change which changes
 * the file that the editor is currently updating
 * @param e The event from the select change
 */
function displayFileSelectChange(e: Event) {
	e.preventDefault();
	editor.display(selectFile.value);
}

/**
 * Load the project bundle, setup the UI and display the initial file
 * @param filename The project bundle file to load
 */
async function load(filename: string) {
	console.log('Loading project...');
	await project.load(filename);
	const projectBundle = project.get()!;
	console.log(`Loaded. Project contains ${projectBundle.files.length + projectBundle.environmentFiles.length} files.`);

	/* generate UI for selecting a file */
	project.getFiles()
		.sort((a, b) => a < b ? -1 : 1)
		.forEach((name) => {
			const option = document.createElement('option');
			option.value = name;
			option.text = name;
			selectFile.appendChild(option);
		});
	selectFile.addEventListener('change', displayFileSelectChange);
	editor.display(selectFile.value);
	divFile.classList.remove('hidden');
}

/* attach button listeners */
loadProjectButton.addEventListener('click', loadProjectButtonClick);
loadProjectButton.removeAttribute('disabled');
projectSelect.removeAttribute('disabled');
runButton.addEventListener('click', runButtonClick);
