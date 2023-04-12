// Each possible duration in seconds
const durationsInSeconds = {
	"1s": 1,
	"10s": 10,
	"1m": 60,
	"10m": 600,
	"1h": 3600,
	"forever": -1
}

export function setup({ settings, onCharacterSelectionLoaded }) {
	createSettings(settings);

	onCharacterSelectionLoaded(ctx => {
		// Watch for class changes to <body> to detect Swal changes
		const observer = new MutationObserver(() => mutationCallback());
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
// Note: We could watch for the new DOM node instead, but it
// fires too late to prevent a layout shift and paint.
function mutationCallback() {
	checkSwal();

	// If Swal class is removed, we need to clean up our custom attribute
	if (!document.body.classList.contains("swal2-shown")) {
		document.body.removeAttribute("data-welcome-back");
	}
}

// Dismiss Swal if within duration, and apply custom attribute to prevent animations
function checkSwal() {
	// Check that modal is in correct state
	if (!Swal.isVisible() || Swal.isLoading()) {
		return;
	}

	// Check that modal is "Welcome Back" prompt
	if (Swal.getTitle()?.innerText !== getLangString("MISC_STRING_3")) {
		return;
	}

	// Get duration setting
	const ctx = mod.getContext(import.meta);
	const sectionGeneral = ctx.settings.section("General");
	const duration = sectionGeneral.get("duration");

	// If mod setting is disabled, do nothing
	if (!duration || duration === "disable") {
		return;
	}

	// Close modal if within selected duration, and allow our CSS override to continue
	const secondsAway = game.getOfflineTimeDiff().timeDiff / 1000;
	if (secondsAway <= durationsInSeconds[duration] || duration === "forever") {
		// A custom attribute is used to temporarily override the modal's CSS
		// It's cleaned up automatically by the mutation observer when the animation finishes
		document.body.setAttribute("data-welcome-back", "");

		// Close Welcome Back modal
		// Note: Swal.close() can cause the modal to get stuck as disabled if fired too rapidly
		Swal.clickConfirm();
	}
}
