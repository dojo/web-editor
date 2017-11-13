function wasVisited(object: any, visits: any[]): boolean {
	return visits.indexOf(object) !== -1;
}

function encode(str: string): string {
	return str.replace(/[\u00A0-\u9999<>\&]/g, (i) => `&#${i.charCodeAt(0)}`);
}

function formatString(object: string, includeQuotes: boolean = false): string {
	const result = encode(object);
	if (includeQuotes) {
		return `"${result}"`;
	}

	return result;
}

function formatArray(object: any[], visits: any[]): string {
	if (wasVisited(object, visits)) {
		return `Array[${object.length}]`;
	}
	visits.push(object);
	const result = object.map((i) => stringify(i, [ ...visits ]));
	return `[${result.join(', ')}]`;
}

function formatObject(object: any, visits: any[]) {
	if (wasVisited(object, visits)) {
		return 'Object';
	} else {
		visits.push(object);
		const result: any[] = [];
		Object.keys(object).forEach((key: string) => {
			const value = object[key];
			result.push(`${key}: ${stringify(value, [ ...visits ])}`);
		});
		return `{${result.join(', ')}}`;
	}
}

export function stringify(object: any, visits?: any): string {
	let atTop = false;
	const toStringValue = Object.prototype.toString.call(object);

	if (!visits) {
		visits = [];
		atTop = true;
	}

	if (object == null) {
		return object;
	}
	else if (typeof object === 'string') {
		return formatString(object, !atTop);
	}
	else if (toStringValue === '[object Array]') {
		return formatArray(object, visits);
	}
	else if (toStringValue === '[object Date]' || object instanceof Date) {
		return object.toString();
	}
	else if (typeof object === 'object') {
		return formatObject(object, visits);
	}

	return object;
}
