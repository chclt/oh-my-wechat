import type { Plugin } from "vite";

/**
 *  vweixinf.tc.qq.com 应该是表情包的域名，在 Safari 和 Firefox 下，部分表情包在 HTTP upgrade 时被认为证书无效。
 */

type CspDirective = readonly [string, ...string[]];

const cspDirectives = [
	["default-src", "'self'"],
	["base-uri", "'self'"],
	["object-src", "'none'"],
	["script-src", "'self'", "'wasm-unsafe-eval'"],
	["style-src", "'self'", "'unsafe-inline'"],
	["font-src", "'self'", "data:"],
	[
		"img-src",
		"'self'",
		"data:",
		"blob:",
		"https://qlogo.cn",
		"https://*.qlogo.cn",
		"https://wechat.com",
		"https://*.wechat.com",
		"https://qpic.cn",
		"https://*.qpic.cn",
		"https://gtimg.cn",
		"https://*.gtimg.cn",
		"https://*.qq.com",
		"http://*.qq.com",
	],
	["media-src", "'self'", "blob:"],
	["connect-src", "'self'", "blob:", "https://unpkg.com/@ffmpeg/"],
	["worker-src", "'self'", "blob:"],
	["child-src", "'self'", "blob:"],
	["manifest-src", "'self'"],
	["form-action", "'self'"],
	["upgrade-insecure-requests"],
] as const satisfies readonly CspDirective[];

const devCspDirectives = [
	["upgrade-insecure-requests"],
	[
		"img-src",
		"'self'",
		"data:",
		"blob:",
		"https://qlogo.cn",
		"https://*.qlogo.cn",
		"http://qlogo.cn",
		"http://*.qlogo.cn",
		"https://wechat.com",
		"https://*.wechat.com",
		"http://wechat.com",
		"http://*.wechat.com",
		"https://qpic.cn",
		"https://*.qpic.cn",
		"http://qpic.cn",
		"http://*.qpic.cn",
		"https://gtimg.cn",
		"https://*.gtimg.cn",
		"http://gtimg.cn",
		"http://*.gtimg.cn",
		"https://*.qq.com",
		"http://*.qq.com",
	],
	[
		"connect-src",
		"'self'",
		"blob:",
		"https://unpkg.com/@ffmpeg/",
		"http://localhost:*",
		"http://127.0.0.1:*",
		"ws://localhost:*",
		"ws://127.0.0.1:*",
	],
] as const satisfies readonly CspDirective[];

function createContentSecurityPolicy(isDev: boolean) {
	const directives = isDev
		? cspDirectives.flatMap((directive) => {
				const devDirective = devCspDirectives.find(
					([name]) => name === directive[0],
				);
				if (devDirective?.length === 1) return [];
				return [devDirective ?? directive];
			})
		: cspDirectives;

	return directives.map((directive) => directive.join(" ")).join("; ");
}

function createSecurityMeta(isDev: boolean) {
	return [
		`<meta http-equiv="Content-Security-Policy" content="${createContentSecurityPolicy(isDev)}" />`,
		`<meta name="referrer" content="no-referrer" />`,
	].join("\n\t\t");
}

export default function htmlSecurity(): Plugin {
	let isDev = false;

	return {
		name: "web:html-security",
		configResolved(config) {
			isDev = config.command === "serve";
		},
		transformIndexHtml(html) {
			return html.replace(
				/(<meta\s+charset=["'][^"']+["']\s*\/?>)/i,
				`$1\n\t\t${createSecurityMeta(isDev)}`,
			);
		},
	};
}
