import type IosBackupAdapter from "@/adapters/ios-backup";
import type { Wrapped2024Statistics } from "@/adapters/ios-backup/controllers/wrapped-2024";
import { getDataAdapter } from "@/lib/adapter";
import type { QueryOptions } from "@tanstack/react-query";

export function Wrapped2024StatisticsQueryOptions(): QueryOptions<Wrapped2024Statistics> {
  return {
    queryKey: ["iOSBackupAdapter", "wrapped2024Statistics"],
    queryFn: () =>
      getDataAdapter()
        .getWrapped2024({
          startTime: new Date("2024/1/1"),
          endTime: new Date("2025/1/1"),
        })
        .then((res) => res.data),
  };
}

export function Wrapped2024RandomMediaMessageQueryOptions(): QueryOptions<
  unknown[]
> {
  return {
    queryKey: ["iOSBackupAdapter", "wrapped2024RandomMediaMessage"],
    queryFn: () =>
      getDataAdapter()
        .getWrapped2024RandomMediaMessage({
          limit: 1,
          startTime: new Date("2024/1/1"),
          endTime: new Date("2025/1/1"),
        })
        .then((res) => res.data),
  };
}
