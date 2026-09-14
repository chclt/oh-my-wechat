import specialBrandIdRaw from "./assets/specialBrandUserNames.csv?raw";

export const specialBrandIds = specialBrandIdRaw
	.split("\n")
	.map((id) => id.trim());
