export function setup({ settings, onInterfaceReady }) {
	// Settings
	createSettings(settings);

	// Interface Setup
	onInterfaceReady(ctx => {
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
		hint: " ​ ​ Auto-dismiss popups within this duration", // Minor hack: using zero-width space characters to create margin
		default: "10s",
		onChange: newValue => {
			// TODO: Implement settings callback
		},
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
	// Check for Welcome Back modal
	if (!node.classList || !node.classList.contains("swal2-container") || Swal.getTitle().innerText !== "Welcome Back!") {
		return;
	}

	// Close modal
	// We also delete the node outright to prevent any animation from showing at all
	Swal.close();
	node.remove();
}