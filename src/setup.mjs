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
		hint: " ​ ​ Auto-dismiss Welcome Back popup within this duration.", // Minor hack: using zero-width space characters to create margin
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
	// Check for Welcome Back modal
	if (!Swal.isVisible() || Swal.isLoading() || Swal.getTitle()?.innerText !== "Welcome Back!") {
		return;
	}

	// Get duration setting
	const ctx = mod.getContext(import.meta);
	const sectionGeneral = ctx.settings.section("General");
	const duration = sectionGeneral.get("duration");

	// Check if disabled
	if (!duration || duration === "disable") {
		return;
	}

	// It's too early to read the modal's contents, but we'll delay its layout shift by overriding
	// its CSS styles with a custom attribute.  This will be removed either after determining it's
	// not needed (because the modal did show), or after a cleanup from the observer when the Swal
	// classes are removed (indicating the animation is complete).
	document.body.setAttribute("data-welcome-back", "");

	// Drop to the end of the event queue to let the game first update the modal's contents
	setTimeout(() => {
		const secondsAway = getSecondsFromMessage();

		// Close modal if within selected duration, and allow our CSS override to continue
		if (secondsAway <= durationsInSeconds[duration] || duration === "forever") {
			Swal.clickConfirm(); // Swal.close() can cause the modal to get stuck as disabled if fired too rapidly
		} else {
			// Or if the duration isn't met and the modal is shown,
			// remove our custom attribute and let their CSS show as normal
			document.body.removeAttribute("data-welcome-back");
		}
	}, 0);
}

// Get second remaining from Welcome Back sentence.  Example sentences:
//   "You were gone for roughly 33 seconds"
//   "You were gone for roughly 3 minutes, 1 second"
//   "You were gone for roughly 1 hour, 38 minutes, 54 seconds"
//   "You were gone for roughly 1 day, 0 seconds"
function getSecondsFromMessage() {
	// Scan modal for Welcome Back string
	const welcomeBackSentence = Swal.getHtmlContainer()?.firstChild?.firstChild?.firstChild?.textContent;
	if (!welcomeBackSentence) {
		console.error("Cannot find Welcome Back modal.");
		return 0;
	}

	// Extract duration from string using wizardy.  But also named capture groups.
	const re = new RegExp(
		"(((?<day>\\d+)\\sday).*?)?" +
		"(((?<hour>\\d+)\\shour).*?)?" +
		"(((?<min>\\d+)\\sminute).*?)?" +
		"(((?<sec>\\d+)\\ssecond).*?)?$" );
	const matches = welcomeBackSentence.match(re);
	if (!matches) {
		console.error("Cannot read time remaining from Welcome Back modal.");
		return 0;
	}

	// Calculate as total seconds and return
	const days = matches.groups.day || 0;
	const hours = matches.groups.hour || 0;
	const mins = matches.groups.min || 0;
	const secs = matches.groups.sec || 0;
	return parseInt(secs) + (parseInt(mins) * 60) + (parseInt(hours) * 3600) + (parseInt(days) * 86400);
}
