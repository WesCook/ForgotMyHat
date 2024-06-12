// Each possible duration in seconds
const durationsInSeconds = {
	"1s": 1,
	"10s": 10,
	"1m": 60,
	"10m": 600,
	"1h": 3600,
	"forever": -1
}

// Milliseconds since character was last played
// Stored early because it's overwritten when the "Welcome Back" Swal first runs
let timeDiff;

export function setup({ settings, onCharacterSelectionLoaded, onCharacterLoaded }) {
	createSettings(settings);

	onCharacterSelectionLoaded(() => {
		// Watch for class changes to <body> to detect Swal changes
		const observer = new MutationObserver(() => bodyClassChange());
		observer.observe(document.body, { childList: false, attributes: true, attributeFilter: ["class"] });
	});

	onCharacterLoaded(() => {
		timeDiff = game.getOfflineTimeDiff().timeDiff;
	});
}

function createSettings(settings) {
	const sectionGeneral = settings.section("General");

	// Duration
	sectionGeneral.add({
		type: "dropdown",
		name: "duration",
		label: "Duration",
		hint: "Auto-dismiss “Welcome Back” popup within this time.",
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

// When <body> classes change, look for a Swal modal and update accordingly
// Note: We could watch for the new DOM node instead, but it fires too late
// to prevent a layout shift and paint.
function bodyClassChange() {
	// Check that modal is in correct state
	if (!Swal.isVisible() || Swal.isLoading()) {
		return;
	}

	// Check that modal is "Welcome Back" prompt
	if (Swal.getTitle()?.innerText !== getLangString("MISC_STRING_3")) {
		return;
	}

	// Get duration from mod settings
	const ctx = mod.getContext(import.meta);
	const sectionGeneral = ctx.settings.section("General");
	const duration = sectionGeneral.get("duration");

	// If mod setting is disabled, do nothing
	if (!duration || duration === "disable") {
		return;
	}

	// Close "Welcome Back" modal if within selected duration
	// Note: Swal.close() can cause the modal to get stuck as disabled if fired too rapidly
	const secondsAway = timeDiff / 1000;
	if (secondsAway <= durationsInSeconds[duration] || duration === "forever") {
		Swal.clickConfirm();
	}
}
