/**
 * 全文搜索分词器。
 *
 * 微信（WCDB）使用的是「一元 + 二元」(OneOrBinary / Verbatim) 分词策略：
 * 对中文、日文等没有空格分隔的语言，把每段连续文本拆成「单字 (unigram)」
 * 加「相邻两字 (bigram)」，再交给搜索引擎建立倒排索引。
 *
 * 官方 `@sqlite.org/sqlite-wasm` 不包含微信的自定义分词器，而 FTS5 内置的
 * `unicode61` 不会切分中文、`trigram` 又要求查询词至少三个字符（中文搜「在」
 * 「吃饭」会失效）。因此我们在 JavaScript 端自己做「一元 + 二元」预分词，把
 * 结果用空格连接后存入 FTS5 的 `tokenizedBody` 列。
 *
 * 关键约束：**建立索引与执行查询必须使用同一个分词函数**，否则查询期与建索引期
 * 切出的 token 不一致，会导致漏匹配。
 */

/**
 * 把一段文本切成「一元 + 相邻二元」token，并用空格连接成可供 FTS5 索引/查询的字符串。
 *
 * 例：`"田博线下"` → `"田 田博 博 博线 线 线下 下"`。
 *
 * @param sourceText 原始文本（消息正文或用户输入的搜索词）。
 * @returns 以空格连接的 token 串；输入为空时返回空字符串。
 */
export function tokenizeForFullTextSearch(sourceText: string): string {
	const normalizedText = String(sourceText).replace(/\s+/g, " ").trim();
	if (normalizedText.length === 0) {
		return "";
	}

	// 用 Array.from 而非按 UTF-16 码元遍历，确保表情等增补平面字符（surrogate
	// pair）被当作单个字符处理，不会被从中间切断。
	const characters = Array.from(normalizedText);
	const tokens: string[] = [];

	for (
		let characterIndex = 0;
		characterIndex < characters.length;
		characterIndex++
	) {
		const currentCharacter = characters[characterIndex];

		// 跳过纯空格 token。
		if (currentCharacter === " ") {
			continue;
		}

		// 一元：当前单字。
		tokens.push(currentCharacter);

		// 二元：当前字与下一个字的组合（下一个字不是空格时）。
		const nextCharacter = characters[characterIndex + 1];
		if (nextCharacter !== undefined && nextCharacter !== " ") {
			tokens.push(currentCharacter + nextCharacter);
		}
	}

	return tokens.join(" ");
}

/**
 * 把用户输入的搜索词转成 FTS5 `MATCH` 表达式。
 *
 * 先用与建索引相同的分词函数切出 token，再把每个 token 用双引号包成 FTS5 短语，
 * 空格连接（FTS5 中空格分隔的多个短语默认是 AND 语义）。双引号可避免 token 里
 * 的字符被 FTS5 当作查询语法（运算符等）解析。
 *
 * @param searchText 用户输入的原始搜索词。
 * @returns FTS5 MATCH 表达式；无有效 token 时返回空字符串（调用方应据此跳过查询）。
 */
export function buildFullTextMatchExpression(searchText: string): string {
	const tokenizedSearchText = tokenizeForFullTextSearch(searchText);
	if (tokenizedSearchText.length === 0) {
		return "";
	}

	return tokenizedSearchText
		.split(" ")
		.filter((token) => token.length > 0)
		.map((token) => `"${escapeFullTextPhrase(token)}"`)
		.join(" ");
}

/**
 * 转义 FTS5 短语内的双引号（FTS5 中双引号通过叠写两个双引号来转义）。
 */
function escapeFullTextPhrase(phrase: string): string {
	return phrase.replace(/"/g, '""');
}
