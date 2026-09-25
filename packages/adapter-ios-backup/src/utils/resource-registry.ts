interface ResourceEntry<T> {
	pending: Promise<T>;
	count: number;
	/** 资源解析完成后才设置回收函数；仍在加载中时为 undefined。 */
	dispose?: () => void;
}

/** Each acquisition owns a reference until release, including while loading. */
export class ResourceRegistry<T> {
	private readonly entries = new Map<string, ResourceEntry<T>>();
	private readonly references = new Map<
		string,
		{ key: string; entry: ResourceEntry<T> }
	>();

	constructor(private readonly dispose: (resource: T) => void) {}

	acquire(
		key: string,
		referenceId: string,
		load: () => Promise<T>,
	): Promise<T> {
		let entry = this.entries.get(key);
		if (!entry) {
			// 在 entry 创建时就启动加载，让计数从第一个等待者起就生效，
			// 避免加载期间 release 因 entry 不存在而被忽略造成泄漏。
			const created: ResourceEntry<T> = {
				count: 0,
				pending: Promise.resolve()
					.then(load)
					.then(
						(resource) => {
							created.dispose = () => this.dispose(resource);
							// 加载期间所有使用者都已 release，这里收尾时立即回收。
							if (created.count === 0) created.dispose();
							return resource;
						},
						(error) => {
							// 加载失败：移除 entry 以便后续重试。
							if (this.entries.get(key) === created) this.entries.delete(key);
							throw error;
						},
					),
			};
			this.entries.set(key, created);
			entry = created;
		}
		entry.count += 1;
		this.references.set(referenceId, { key, entry });
		return entry.pending.catch((error) => {
			this.release(referenceId);
			throw error;
		});
	}

	release(referenceId: string) {
		const reference = this.references.get(referenceId);
		if (!reference) return;
		this.references.delete(referenceId);
		const { key, entry } = reference;
		entry.count -= 1;
		if (entry.count > 0) return;
		if (this.entries.get(key) === entry) this.entries.delete(key);
		// 仍在加载时由 pending 持有 entry，完成加载后回收资源。
		entry.dispose?.();
	}

	clear() {
		for (const entry of this.entries.values()) {
			entry.count = 0;
			entry.dispose?.();
		}
		this.entries.clear();
		this.references.clear();
	}
}
