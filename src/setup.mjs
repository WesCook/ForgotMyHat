export function setup({ settings, onCharacterSelectionLoaded }) {
	// Settings
	createSettings(settings);

	onCharacterSelectionLoaded(ctx => {
		// Watch for node changes to <body>
		const observer = new MutationObserver(records => mutationCallback(records));
		observer.observe(document.body, { childList: true });
	});
}

function createSettings(settings) {
	const sectionGeneral = settings.section("General");

	// Duration
	sectionGeneral.add({
		type: "dropdown",
		name: "duration",
		label: "Duration",
		hint: " ​ ​ Auto-dismiss popups within this duration.", // Minor hack: using zero-width space characters to create margin
		default: "10s",
		options: [
			{ value: "disable", display: "0 seconds (Disable)" },
			{ value: "1s", display: "1 second" },
			{ value: "10s", display: "10 seconds" },
			{ value: "1m", display: "1 minute" },
			{ value: "10m", display: "10 minutes" },
			{ value: "1h", display: "1 hour" },
			{ value: "forever", display: "Forever" }
		]
	});
}

function mutationCallback(records) {
	if (!records) {
		return;
	}

	records.forEach(record => {
		// Only act on new nodes
		if (record.addedNodes.length === 0) {
			return;
		}

		// Examine new nodes
		record.addedNodes.forEach(node => checkSwal(node));
	});
}

function checkSwal(node) {
	// Drop to the end of the event queue to let the game first update the modal's contents
	setTimeout(() => {
		// Check for Welcome Back modal
		if (!node.classList?.contains("swal2-container") || Swal.getTitle().innerText !== "Welcome Back!") {
			return;
		}

		// Get string of time remaining.  Examples:
		// "You were gone for roughly 33 seconds"
		// "You were gone for roughly 3 minutes, 1 second"
		// "You were gone for roughly 1 hour, 38 minutes, 54 seconds"
		// "You were gone for roughly 1 day, 0 seconds"
		const timeSentence = Swal.getHtmlContainer()?.firstChild?.firstChild?.firstChild?.textContent;
		if (!timeSentence) {
			return;
		}

		// Extract duration from string using wizardy.  But also named capture groups.
		const re = new RegExp(
		"(((?<day>\\d+)\\sday).*?)?" +
		"(((?<hour>\\d+)\\shour).*?)?" +
		"(((?<min>\\d+)\\sminute).*?)?" +
		"(((?<sec>\\d+)\\ssecond).*?)?$" );
		const matches = timeSentence.match(re);
		if (!matches) {
			return;
		}

		// Calculate as total seconds
		const days = matches.groups.day || 0;
		const hours = matches.groups.hour || 0;
		const mins = matches.groups.min || 0;
		const secs = matches.groups.sec || 0;
		const secondsAway = parseInt(secs) + (parseInt(mins) * 60) + (parseInt(hours) * 3600) + (parseInt(days) * 86400);

		// Get duration setting
		const ctx = mod.getContext(import.meta);
		const sectionGeneral = ctx.settings.section("General");
		const duration = sectionGeneral.get("duration");

		// Check if disabled
		if (!duration || duration === "disable") {
			return;
		}

		// Each possible duration in seconds
		const durationsInSeconds = {
			"1s": 1,
			"10s": 10,
			"1m": 60,
			"10m": 600,
			"1h": 3600,
			"forever": -1
		}

		// Close modal if within selected duration
		// We also delete the node outright to prevent any animation from showing at all
		if (secondsAway <= durationsInSeconds[duration] || duration === "forever") {
			Swal.close();
			node.remove();
		}
	}, 0);
}
