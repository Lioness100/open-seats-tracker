interface Section {
	course: string;
	id: string;
	openSeats: number;
	sectionNumber: string;
	subjectId: string;
}

interface TermDataResponse {
	cartSections: Section[];
	currentSections: Section[];
}

const API_URL = new URL(`/api/term-data/${process.env.UMASS_TERM}`, process.env.PROXY_URL);

async function sendWebhook(message: string) {
	if (!process.env.WEBHOOK_URL) {
		return;
	}

	await fetch(process.env.WEBHOOK_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ content: message })
	});
}

async function checkOpenSeats() {
	try {
		const response = await fetch(API_URL, {
			method: 'GET',
			headers: process.env.API_KEY ? { Authorization: `Bearer ${process.env.API_KEY}` } : {}
		});

		const data = (await response.json()) as TermDataResponse;
		return [...data.cartSections, ...data.currentSections];
	} catch (error) {
		console.error('Error checking open seats:', error);
		await sendWebhook(`Error checking open seats: ${error}`);
		return null;
	}
}

console.log('Schedule Tracker');
console.log(`Tracking term: ${process.env.UMASS_TERM}`);
console.log(`Checking every ${Number(process.env.CHECK_INTERVAL) / 1000} seconds\n`);

let lastSections: Section[] | null = null;

const check = async () => {
	const sections = await checkOpenSeats();
	if (sections === null) {
		return;
	}

	const timestamp = new Date().toLocaleString();

	if (lastSections === null) {
		const changeLog = sections
			.map((s) => `${s.subjectId} ${s.course} ${s.sectionNumber}: ${s.openSeats} open seats`)
			.join('\n');

		console.log(changeLog);
		await sendWebhook(changeLog);
	} else {
		let hasChanges = false;
		const changes: string[] = [];

		for (const section of sections) {
			const lastSection = lastSections.find((s) => s.id === section.id);
			if (lastSection && lastSection.openSeats !== section.openSeats) {
				hasChanges = true;
				const change = section.openSeats - lastSection.openSeats;
				const changeText = change > 0 ? `+${change}` : `${change}`;
				const changeLog = `${section.subjectId} ${section.course} ${section.sectionNumber}: ${lastSection.openSeats} → ${section.openSeats} (${changeText})`;
				changes.push(changeLog);
				console.log(`[${timestamp}] ${changeLog}`);
			}
		}

		if (hasChanges) {
			await sendWebhook(changes.join('\n'));
		} else {
			console.log(`[${timestamp}] No changes`);
		}
	}

	// eslint-disable-next-line require-atomic-updates
	lastSections = sections;
};

await check();
setInterval(() => void check(), Number(process.env.CHECK_INTERVAL));

export {};
