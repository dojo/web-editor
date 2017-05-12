import request from '@dojo/core/request';
import Task from '@dojo/core/async/Task';

export interface GistFile {
	'filename': string;
	'type': string;
	'language': string;
	'raw_url': string;
	'size': number;
}

export interface Gist {
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

const API_GITHUB = 'https://api.github.com/';
const GIST_REPLACEMENT_HOST = 'rawgit.com';
const GIST_SOURCE_HOST = 'gist.githubusercontent.com';

export async function getById(id: string): Task<{ description: string, projectJson: string; } | undefined> {
	const response = await request.get(`${API_GITHUB}gists/${id}`);
	if (!response.ok) {
		return;
	}
	const { description, files } = await response.json<Gist>();
	for (const key in files) {
		const file = files[key];
		if (file.filename.toLowerCase() === 'project.json' && file.type === 'application/json') {
			return {
				description,
				projectJson: file['raw_url'].replace(GIST_SOURCE_HOST, GIST_REPLACEMENT_HOST)
			};
		}
	}
}

/**
 * Return an array of objects which describe gists that contain `project.json` files that can be loaded
 * @param username The GitHub username to retrieve the gists for
 */
export async function getByUsername(username: string): Task<{ description: string; id: string, projectJson: string; }[]> {
	const response = await request.get(`${API_GITHUB}users/${username}/gists`);
	if (!response.ok) {
		return [];
	}
	const gists = await response.json<Gist[]>();
	return gists
		.filter((gist) => {
			for (const key in gist.files) {
				if (gist.files[key].type === 'application/json' && gist.files[key].filename.toLowerCase() === 'project.json') {
					return true;
				}
			}
			return false;
		})
		.map((gist) => {
			let projectJson = '';
			for (const key in gist.files) {
				const file = gist.files[key];
				if (file.type === 'application/json' && file.filename.toLowerCase() === 'project.json') {
					projectJson = file['raw_url'].replace(GIST_SOURCE_HOST, GIST_REPLACEMENT_HOST);
				}
			}
			return {
				description: gist.description,
				id: gist.id,
				projectJson
			};
		});
}
