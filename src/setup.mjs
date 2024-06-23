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
let offlineTimestamp;

export function setup({ settings, patch }) {
	createSettings(settings);

	// Offline time value is overwritten when the offline progression runs, so we capture it early in a patched function
	patch(Game, 'enterOfflineLoop').before(function() {
		offlineTimestamp = this.tickTimestamp;
	});

	// Proxy and replace the "add modal to queue" function to intercept the "Welcome Back" modal when it's added.
	// The game enqueues the modal before the offline ticks are calculated, then updates the message later.
	// While we can't get the final time difference here, we can still compare it before the offline calculation runs.
	window.addModalToQueue = new Proxy(addModalToQueue, {
		apply(target, thisArg, args) {
			// Get duration from mod settings
			const ctx = mod.getContext(import.meta);
			const sectionGeneral = ctx.settings.section("General");
			const duration = sectionGeneral.get("duration");

			// Should only be one argument, the modal, but just in case
			// We use for...of instead of forEach so we can use break to call the original function early
			for (const modal of args) {
				// If mod is disabled, run as normal
				if (!duration || duration === "disable") {
					break;
				}

				// If patch failed to capture timestamp, run as normal
				if (!offlineTimestamp) {
					console.error("Forgot My Hat: Offline timestamp could not be captured");
					break;
				}

				// If time away exceeds selected duration, run as normal
				const secondsElapsed = Math.floor((Date.now() - offlineTimestamp) / 1000);
				if (duration !== "forever" && secondsElapsed > durationsInSeconds[duration]) {
					break;
				}

				// If "Welcome back" modal is found, return without running the original function
				if (modal?.title === getLangString("MISC_STRING_3")) {
					return; // Don't let modal run
				}
			};

			// Call the original function with no modification
			return target.apply(thisArg, args);
		}
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
