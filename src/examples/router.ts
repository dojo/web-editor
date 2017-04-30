import Router from '@dojo/routing/Router';
import { Parameters } from '@dojo/routing/interfaces';
import HashHistory from '@dojo/routing/history/HashHistory';

export interface GistParameters extends Parameters {
	id: string;
}

const router = new Router<GistParameters>({ history: new HashHistory() });
export default router;
