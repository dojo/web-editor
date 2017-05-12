import { Request } from '@dojo/routing/interfaces';
import Route from '@dojo/routing/Route';

class RouteStub {
	path: string;
	exec: (request: Request<any, any>) => void;

	constructor ({ path, exec }: { path: string, exec: (request: Request<any, any>) => void; }) {
		this.path = path;
		this.exec = exec;
	}
}

export default RouteStub as any as typeof Route;
