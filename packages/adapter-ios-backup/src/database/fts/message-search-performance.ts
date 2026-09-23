type Stage =
	| "listTables"
	| "selectRows"
	| "decompress"
	| "tokenize"
	| "insert"
	| "yield"
	| "commit";

/** Created only when profiling is enabled; disabled instrumentation never reads the clock. */
export class MessageSearchPerformance {
	private readonly buildStartTime = performance.now();
	private readonly starts: Partial<Record<Stage, number>> = {};
	private readonly elapsed: Record<Stage, number> = {
		listTables: 0,
		selectRows: 0,
		decompress: 0,
		tokenize: 0,
		insert: 0,
		yield: 0,
		commit: 0,
	};
	private readonly counts = { tables: 0, rows: 0 };

	start(stage: Stage): void {
		this.starts[stage] = performance.now();
	}

	end(stage: Stage): void {
		this.elapsed[stage] += performance.now() - this.starts[stage]!;
	}

	count(kind: keyof MessageSearchPerformance["counts"], amount: number): void {
		this.counts[kind] += amount;
	}

	log(indexedMessageCount: number): void {
		const totalMs = performance.now() - this.buildStartTime;
		console.log(
			`[索引构建] 总耗时 ${totalMs.toFixed(0)}ms | 表数 ${this.counts.tables}` +
				` | 读到行数 ${this.counts.rows} | 入索引 ${indexedMessageCount}\n` +
				`  列举表 ${this.elapsed.listTables.toFixed(0)}ms` +
				` | 查询取行 ${this.elapsed.selectRows.toFixed(0)}ms` +
				` | 解压(postProcess) ${this.elapsed.decompress.toFixed(0)}ms` +
				` | 分词 ${this.elapsed.tokenize.toFixed(0)}ms` +
				` | 插入索引 ${this.elapsed.insert.toFixed(0)}ms` +
				` | 中途让出 ${this.elapsed.yield.toFixed(0)}ms` +
				` | 末次提交 ${this.elapsed.commit.toFixed(0)}ms`,
		);
	}
}
