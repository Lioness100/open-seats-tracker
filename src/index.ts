interface ScheduleResponse {
	sections: { openSeats: number }[];
}

const API_PATH = '/api/terms/Spring%202026/schedules/generate';
const REQUEST_BODY = { cartSections: [{ course: '311', registrationNumber: 85_717, subjectId: 'SPANISH' }] };

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
		const apiUrl = `${process.env.PROXY_URL}${API_PATH}`;

		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: process.env.API_KEY ? { Authorization: `Bearer ${process.env.API_KEY}` } : {},
			body: JSON.stringify(REQUEST_BODY)
		});

		const data = (await response.json()) as ScheduleResponse;
		return data.sections[0].openSeats;
	} catch (error) {
		console.error('Error checking open seats:', error);
		await sendWebhook(`Error checking open seats: ${error}`);
		return null;
	}
}

console.log('Spanish 311 Open Seats Tracker');
console.log(`Checking every ${(Number(process.env.CHECK_INTERVAL) || 60_000) / 1000} seconds\n`);

let lastOpenSeats: number | null = null;

const check = async () => {
	const openSeats = await checkOpenSeats();
	if (openSeats === null) {
		return;
	}

	const timestamp = new Date().toLocaleString();

	if (lastOpenSeats === null) {
		console.log(`[${timestamp}] Spanish 311 has ${openSeats} open seats`);
		await sendWebhook(`Spanish 311 has **${openSeats}** open seats`);
	} else if (openSeats === lastOpenSeats) {
		console.log(`[${timestamp}] No change (${openSeats} open seats)`);
	} else {
		const change = openSeats - lastOpenSeats;
		const changeText = change > 0 ? `+${change}` : `${change}`;
		console.log(`[${timestamp}] Open seats changed: ${lastOpenSeats} → ${openSeats} (${changeText})`);
		await sendWebhook(`🔔 Spanish 311 seats changed: ${lastOpenSeats} → **${openSeats}** (${changeText})`);
	}

	// eslint-disable-next-line require-atomic-updates
	lastOpenSeats = openSeats;
};

await check();
setInterval(() => void check(), Number(process.env.CHECK_INTERVAL) || 60_000);

export {};
