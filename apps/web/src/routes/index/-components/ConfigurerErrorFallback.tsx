export default function ConfigurerErrorFallback() {
	if (typeof Worker === "undefined") {
		return (
			<p className="mt-5 w-full text-center">
				你的浏览器不支持 Web Worker，请更新浏览器版本或检查浏览器设置
			</p>
		);
	}

	return (
		<p className="mt-5 w-full text-center">
			遇到未知错误，请刷新页面重试或联系开发者
		</p>
	);
}
