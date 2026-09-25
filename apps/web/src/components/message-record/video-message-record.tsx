import {
	VideoMessageRecordDefault,
	type VideoMessageRecordDefaultProps,
} from "./video-message-record-default";

interface VideoMessageRecordProps extends VideoMessageRecordDefaultProps {
	variant: "default" | string;
}

export default function VideoMessageRecord({
	message,
	record,
	variant = "default",
	...props
}: VideoMessageRecordProps) {
	if (variant === "default") {
		return (
			<VideoMessageRecordDefault message={message} record={record} {...props} />
		);
	}
	return <span className="inline">视频</span>;
}
