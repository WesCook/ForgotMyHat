// Each possible duration in seconds
const durationsInSeconds = {
	"1s": 1,
	"10s": 10,
	"1m": 60,
	"10m": 600,
	"1h": 3600,
	"forever": -1
}

// Seconds since character was last loaded
let secondsSinceLoaded = 0;

export function setup({ settings, onCharacterSelectionLoaded, patch }) {
	createSettings(settings);

	// Offline time value is overwritten when the "Welcome Back" Swal runs, so we capture it early in a patched function
	patch(Game, 'exitOfflineLoop').before(function() {
		secondsSinceLoaded = (Date.now() - this._offlineInfo.startTime) / 1000;
	});

	// Watch for class changes to <body> to detect Swal changes
	// This attaches the observer early, when main menu is loaded
	onCharacterSelectionLoaded(() => {
		const observer = new MutationObserver(() => bodyClassChange());
		observer.observe(document.body, { childList: false, attributes: true, attributeFilter: ["class"] });
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
		default: "1m",
		options: [
			{ value: "disable", display: "Disable" },
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
// We could watch for the new DOM node instead, but it fires too late to
// prevent a layout shift and paint.
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
	// Swal.close() can cause the modal to get stuck as disabled if fired too quickly,
	// as happens when tabbing in and out quickly, so use clickConfirm() instead.
	if (secondsSinceLoaded <= durationsInSeconds[duration] || duration === "forever") {
		Swal.clickConfirm();
	}
}
