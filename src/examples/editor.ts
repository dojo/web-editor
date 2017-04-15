import Editor from '../Editor';
import project from '../project';

/* get references to key DOM nodes */
const divFile = <HTMLDivElement> document.getElementById('div-file');
const loadProjectButton = <HTMLButtonElement> document.getElementById('load-project');
const projectDiv = <HTMLInputElement> document.getElementById('project');
const selectFile = <HTMLSelectElement> document.getElementById('select-file');
const compileProjectButton = <HTMLButtonElement> document.getElementById('compile-project');
const compilerOut = <HTMLDivElement> document.getElementById('compiler-out');

/* create an editor */
const divEditor = <HTMLDivElement> document.getElementById('editor');
const editor = new Editor(divEditor);

/**
 * Listener that will be attached to the load project button click
 * @param e The mouse event
 */
async function loadProjectButtonClick(e: MouseEvent) {
	e.preventDefault();
	await load(projectDiv.value);
	loadProjectButton.disabled = true;
	loadProjectButton.removeEventListener('click', loadProjectButtonClick);
}

/**
 * Listener that will be attached to the compile project button click
 * @param e The mouse event
 */
async function compileProjectButtonClick(e: MouseEvent) {
	e.preventDefault();
	while (compilerOut.firstChild) {
		compilerOut.removeChild(compilerOut.firstChild);
	}
	compilerOut.innerHTML = '<h3>Compiling...</h3>';
	const files = await project.emit();
	while (compilerOut.firstChild) {
		compilerOut.removeChild(compilerOut.firstChild);
	}
	files
		.sort(({ name: namea }, { name: nameb }) => namea < nameb ? -1 : 1)
		.forEach((file) => {
			const header = document.createElement('h3');
			header.textContent = file.name;
			compilerOut.appendChild(header);
			const content = document.createElement('pre');
			content.textContent = file.text;
			compilerOut.appendChild(content);
		});
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
compileProjectButton.addEventListener('click', compileProjectButtonClick);
