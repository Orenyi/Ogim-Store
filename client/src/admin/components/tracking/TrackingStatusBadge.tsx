import type { TrackingStatus } from "../../types/tracking.types";
import {
  getTrackingStatusColor,
  getTrackingStatusLabel,
} from "../../utils/tracking.utils";

type Props = {
  status: TrackingStatus;
};

export default function TrackingStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${getTrackingStatusColor(status)}`}
    >
      {getTrackingStatusLabel(status)}
    </span>
  );
}
