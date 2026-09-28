export default function GreetingMessageListError({ error }: { error: Error }) {
	return (
		<div role="alert" className="p-4">
			<p className="text-sm text-center text-muted-foreground">
				好友申请列表读取失败
			</p>
		</div>
	);
}
