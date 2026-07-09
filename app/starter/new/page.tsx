import { FeedingFormScreen } from "@/components/starter/feeding-form-screen";
import { emptyFeedingFormValues } from "@/lib/validate-feeding";

export default function Page() {
  return <FeedingFormScreen initialValues={emptyFeedingFormValues()} />;
}
