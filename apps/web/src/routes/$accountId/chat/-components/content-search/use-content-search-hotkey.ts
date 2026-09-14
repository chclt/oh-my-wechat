import { useHotkey } from "@tanstack/react-hotkeys";
import { useContentSearchRoute } from "./use-content-search-route";

export function useContentSearchHotkey() {
	const { isSearchEnabled, openSearch, closeSearch } = useContentSearchRoute();

	useHotkey(
		"Mod+F",
		(event) => {
			if (
				event.isComposing ||
				document.activeElement?.closest('[role="dialog"], [role="alertdialog"]')
			)
				return;

			// Only override browser find when opening app search, including key repeats.
			event.preventDefault();
			if (event.repeat) return;

			openSearch({ focus: true });
		},
		{ ignoreInputs: false, preventDefault: false, stopPropagation: false },
	);

	useHotkey(
		"Escape",
		(event) => {
			if (
				event.defaultPrevented ||
				event.isComposing ||
				document.activeElement?.closest('[role="dialog"], [role="alertdialog"]')
			)
				return;

			event.preventDefault();
			closeSearch();
		},
		{
			enabled: isSearchEnabled,
			preventDefault: false,
			stopPropagation: false,
		},
	);
}
