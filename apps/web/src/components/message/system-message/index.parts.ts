import type { SystemMessageProps } from "./types.ts";

export { SystemMessageAbstract as Abstract } from "./system-message-abstract.tsx";
export { SystemMessageAuto as Auto } from "./system-message-auto.tsx";
export { SystemMessageDefault as Default } from "./system-message-default.tsx";
export { SystemMessageReferenced as Referenced } from "./system-message-referenced.tsx";

export type Props = SystemMessageProps;
